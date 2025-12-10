package com.autric.upbit.domain.account.service;

import com.autric.upbit.domain.account.dto.response.*;
import com.autric.upbit.domain.account.entity.AccountHistory;
import com.autric.upbit.domain.account.repository.AccountRepository;
import com.autric.upbit.domain.member.entity.Member;
import com.autric.upbit.domain.trade.entity.TradingStatistics;
import com.autric.upbit.domain.trade.service.TradingStatisticsService;
import com.autric.upbit.external.upbit.client.UpbitApiClient;
import com.autric.upbit.external.upbit.dto.response.UpbitAccountResponse;
import com.autric.upbit.external.upbit.dto.response.UpbitDepositResponse;
import com.autric.upbit.external.upbit.dto.response.UpbitTradePriceResponse;
import com.autric.upbit.external.upbit.dto.response.UpbitWithdrawResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 투자손익 관련 비즈니스 로직을 처리하는 서비스
 *
 * 주요 기능:
 * - 일별 자산 스냅샷 저장 (스케줄러에서 호출)
 * - 일별/월별/연도별 투자손익 조회
 * - 트레이딩 성과 지표 계산 (MDD, 승률, 연환산 수익률 등)
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AccountService {

    private final AccountRepository accountRepository;
    private final UpbitApiClient upbitApiClient;
    private final TradingStatisticsService tradingStatisticsService;

    /** 업비트 API 날짜 포맷 (ISO 8601) */
    private static final DateTimeFormatter UPBIT_DATE_FORMAT = DateTimeFormatter.ISO_OFFSET_DATE_TIME;

    // ============================================
    // 스냅샷 저장 로직
    // ============================================

    /**
     * 특정 회원의 일별 자산 스냅샷을 저장.
     *
     * 1. 중복 스냅샷 체크 (이미 존재하면 스킵)
     * 2. 업비트 API로 현재 잔고 조회 (원화 + 코인)
     * 3. 각 코인의 현재가 조회하여 평가액 계산
     * 4. 당일 입출금 내역 조회
     * 5. 전일 대비 일일 손익 계산
     * 6. DB에 스냅샷 저장
     *
     * [손익 계산 공식]
     * 일일손익 = (오늘 총자산 - 어제 총자산) - (입금 - 출금)
     * 일일수익률 = 일일손익 / 어제 총자산 * 100
     *
     * @param member 대상 회원
     * @param snapshotDate 스냅샷 날짜 (업비트 기준 전일)
     */
    @Transactional
    public void saveSnapshot(Member member, LocalDate snapshotDate) {
        // 중복 체크 - 이미 해당 날짜 스냅샷이 있으면 스킵
        if (accountRepository.findByMemberAndSnapshotDate(member, snapshotDate).isPresent()) {
            log.info("스냅샷 이미 존재: member={}, date={}", member.getId(), snapshotDate);
            return;
        }

        String accessKey = member.getUpbitApiKey().getAccessKey();
        String secretKey = member.getUpbitApiKey().getSecretKey();

        try {
            // 업비트 잔고 조회 (GET /v1/accounts)
            List<UpbitAccountResponse> accounts = upbitApiClient.getAccounts(accessKey, secretKey);

            long krwBalance = 0L;   // 원화 잔고
            long coinValue = 0L;    // 코인 평가액 합계

            // 각 자산별 평가액 계산
            for (UpbitAccountResponse account : accounts) {
                // balance: 주문 가능 수량, locked: 주문 중 묶인 수량
                BigDecimal balance = new BigDecimal(account.getBalance());
                BigDecimal locked = new BigDecimal(account.getLocked());
                BigDecimal total = balance.add(locked);  // 총 보유 수량

                if ("KRW".equals(account.getCurrency())) {
                    // 원화인 경우 그대로 합산
                    krwBalance = total.longValue();
                } else {
                    // 코인인 경우 현재가 조회하여 평가액 계산
                    String market = "KRW-" + account.getCurrency();  // ex: KRW-BTC
                    try {
                        UpbitTradePriceResponse price = upbitApiClient.getCurrentPrice(market);
                        if (price != null && price.getTradePrice() != null) {
                            // 코인 평가액 = 보유수량 × 현재가
                            coinValue += total.multiply(price.getTradePrice()).longValue();
                        }
                    } catch (Exception e) {
                        log.warn("시세 조회 실패: market={}, error={}", market, e.getMessage());
                    }
                }
            }

            // 총 자산 = 원화 잔고 + 코인 평가액
            long totalAsset = krwBalance + coinValue;

            // 당일 입출금 내역 조회 (업비트 기준 09:00 ~ 다음날 08:59)
            long deposit = calculateTodayDeposit(accessKey, secretKey, snapshotDate);
            long withdrawal = calculateTodayWithdrawal(accessKey, secretKey, snapshotDate);

            // 전일 스냅샷 조회 (손익 계산 기준점)
            Optional<AccountHistory> prevHistoryOpt = accountRepository
                    .findTopByMemberAndSnapshotDateBeforeOrderBySnapshotDateDesc(member, snapshotDate);

            // 전일 총자산 (없으면 오늘 총자산으로 대체 → 첫 스냅샷인 경우)
            long prevTotalAsset = prevHistoryOpt.map(AccountHistory::getTotalAsset).orElse(totalAsset);

            /**
             * 일일 손익 계산
             *
             * 공식: (오늘 총자산 - 어제 총자산) - (입금 - 출금)
             *
             * 예시:
             * - 어제 100만원, 오늘 120만원, 입금 10만원
             * - 단순 차이: 120 - 100 = +20만원
             * - 실제 손익: 20 - 10 = +10만원 (입금 제외)
             */
            long dailyProfitLoss = (totalAsset - prevTotalAsset) - (deposit - withdrawal);

            /**
             * 일일 수익률 계산
             *
             * 공식: 일일손익 / 전일 총자산 × 100
             *
             * 예시:
             * - 전일 100만원, 일일손익 +10만원
             * - 수익률: 10 / 100 × 100 = 10%
             */
            BigDecimal dailyProfitRate = prevTotalAsset > 0
                    ? BigDecimal.valueOf(dailyProfitLoss * 100).divide(BigDecimal.valueOf(prevTotalAsset), 4, RoundingMode.HALF_UP)
                    : BigDecimal.ZERO;

            // 스냅샷 저장
            AccountHistory history = AccountHistory.builder()
                    .member(member)
                    .snapshotDate(snapshotDate)
                    .totalAsset(totalAsset)
                    .krwBalance(krwBalance)
                    .coinValue(coinValue)
                    .deposit(deposit)
                    .withdrawal(withdrawal)
                    .dailyProfitLoss(dailyProfitLoss)
                    .dailyProfitRate(dailyProfitRate)
                    .build();

            accountRepository.save(history);
            log.info("스냅샷 저장 완료: member={}, date={}, totalAsset={}, dailyPL={}",
                    member.getId(), snapshotDate, totalAsset, dailyProfitLoss);

        } catch (Exception e) {
            log.error("스냅샷 저장 실패: member={}, date={}, error={}",
                    member.getId(), snapshotDate, e.getMessage(), e);
        }
    }

    /**
     * 특정 날짜의 입금 합계를 계산.
     *
     * 업비트 하루 기준: 09:00 ~ 다음날 08:59
     *
     * @param accessKey 업비트 API 키
     * @param secretKey 업비트 시크릿 키
     * @param date 조회 날짜
     * @return 당일 입금 합계 (원)
     */
    private long calculateTodayDeposit(String accessKey, String secretKey, LocalDate date) {
        try {
            // 업비트 입금 내역 조회 (KRW, 완료 상태만)
            List<UpbitDepositResponse> deposits = upbitApiClient.getKrwDeposits(accessKey, secretKey);

            // 업비트 기준 하루: 09:00 ~ 다음날 08:59
            LocalDateTime dayStart = date.atTime(9, 0);
            LocalDateTime dayEnd = date.plusDays(1).atTime(8, 59, 59);

            // 해당 기간 내 입금액 합산
            return deposits.stream()
                    .filter(d -> isWithinRange(parseUpbitDateTime(d.getDoneAt()), dayStart, dayEnd))
                    .mapToLong(d -> d.getAmount().longValue())
                    .sum();
        } catch (Exception e) {
            log.warn("입금 내역 조회 실패: {}", e.getMessage());
            return 0L;
        }
    }

    /**
     * 특정 날짜의 출금 합계를 계산.
     *
     * @param accessKey 업비트 API 키
     * @param secretKey 업비트 시크릿 키
     * @param date 조회 날짜
     * @return 당일 출금 합계 (원)
     */
    private long calculateTodayWithdrawal(String accessKey, String secretKey, LocalDate date) {
        try {
            // 업비트 출금 내역 조회 (KRW, 완료 상태만)
            List<UpbitWithdrawResponse> withdraws = upbitApiClient.getKrwWithdraws(accessKey, secretKey);

            LocalDateTime dayStart = date.atTime(9, 0);
            LocalDateTime dayEnd = date.plusDays(1).atTime(8, 59, 59);

            return withdraws.stream()
                    .filter(w -> isWithinRange(parseUpbitDateTime(w.getDoneAt()), dayStart, dayEnd))
                    .mapToLong(w -> w.getAmount().longValue())
                    .sum();
        } catch (Exception e) {
            log.warn("출금 내역 조회 실패: {}", e.getMessage());
            return 0L;
        }
    }

    /**
     * 날짜가 특정 범위 내에 있는지 확인합.
     */
    private boolean isWithinRange(LocalDateTime dateTime, LocalDateTime start, LocalDateTime end) {
        return dateTime != null && !dateTime.isBefore(start) && !dateTime.isAfter(end);
    }

    /**
     * 업비트 API 날짜 문자열을 LocalDateTime으로 파싱.
     */
    private LocalDateTime parseUpbitDateTime(String dateStr) {
        if (dateStr == null || dateStr.isEmpty()) return null;
        try {
            return LocalDateTime.parse(dateStr, UPBIT_DATE_FORMAT);
        } catch (Exception e) {
            return null;
        }
    }

    // ============================================
    // 일별 조회
    // ============================================

    /**
     * 특정 월의 일별 투자손익을 조회.
     *
     * 1. 해당 월의 일별 스냅샷 데이터 조회 (최신순)
     * 2. 월 시작 전 마지막 스냅샷 조회 (누적 계산 기준점)
     * 3. 날짜순으로 정렬하여 누적 손익/수익률 계산
     * 4. 최신순으로 다시 정렬하여 반환
     *
     * [누적 손익 계산]
     * - 기준: 해당 월 시작 직전의 총자산
     * - 누적손익 = Σ(일일손익)
     * - 누적수익률 = 누적손익 / 기준자산 × 100
     *
     * @param member 대상 회원
     * @param year 연도
     * @param month 월 (1-12)
     * @return 일별 투자손익 응답 (요약 + 상세 리스트)
     */
    public DailyProfitResponse getDailyProfit(Member member, int year, int month) {
        // 해당 월의 일별 데이터 조회 (최신순)
        List<AccountHistory> histories = accountRepository.findDailyByMemberAndYearMonth(member, year, month);

        if (histories.isEmpty()) {
            return DailyProfitResponse.empty();
        }

        // 날짜순으로 정렬 (오래된 것부터) - 누적 계산을 위해
        List<AccountHistory> sortedHistories = new ArrayList<>(histories);
        Collections.reverse(sortedHistories);

        // 월 시작 전 마지막 스냅샷 조회 (누적 계산 기준점)
        LocalDate monthStart = LocalDate.of(year, month, 1);
        Optional<AccountHistory> prevMonthHistory = accountRepository
                .findTopByMemberAndSnapshotDateBeforeOrderBySnapshotDateDesc(member, monthStart);

        // 기준 자산 (이전 달 마지막 자산 또는 첫 번째 데이터)
        long initialTotalAsset = prevMonthHistory.map(AccountHistory::getTotalAsset)
                .orElse(sortedHistories.get(0).getTotalAsset());

        // 누적 손익 계산하며 아이템 생성
        long cumulativePL = 0L;         // 누적 손익
        long totalAssetSum = 0L;        // 평균 자산 계산용
        List<DailyProfitItem> items = new ArrayList<>();
        Long prevTotalAsset = initialTotalAsset;  // 전일 자산 (기초자산 표시용)

        for (AccountHistory history : sortedHistories) {
            // 누적 손익 = 이전 누적 + 오늘 손익
            cumulativePL += history.getDailyProfitLoss();
            totalAssetSum += history.getTotalAsset();

            // 누적 수익률 계산
            BigDecimal cumulativeRate = calculateRate(cumulativePL, initialTotalAsset);

            // DTO 변환 (기초자산 = 전일 총자산)
            items.add(DailyProfitItem.fromEntity(history, prevTotalAsset, cumulativePL, cumulativeRate));

            // 다음 날의 기초자산은 오늘의 총자산
            prevTotalAsset = history.getTotalAsset();
        }

        // 최신순으로 다시 정렬 (UI 표시용)
        Collections.reverse(items);

        // 요약 정보 생성
        AccountHistory first = sortedHistories.get(0);  // 가장 오래된 날
        AccountHistory last = sortedHistories.get(sortedHistories.size() - 1);  // 가장 최근 날

        InvestmentProfitSummary summary = InvestmentProfitSummary.of(
                first.getSnapshotDate().toString(),                    // 기간 시작
                last.getSnapshotDate().toString(),                     // 기간 종료
                cumulativePL,                                          // 누적 손익
                calculateRate(cumulativePL, initialTotalAsset),        // 누적 수익률
                totalAssetSum / sortedHistories.size()                 // 평균 투자금액
        );

        return DailyProfitResponse.of(summary, items);
    }

    // ============================================
    // 월별 조회
    // ============================================

    /**
     * 특정 연도의 월별 투자손익을 조회.
     *
     * 1. 해당 연도의 전체 일별 데이터 조회
     * 2. 월별로 그룹핑
     * 3. 연도 시작 전 마지막 스냅샷 조회 (누적 계산 기준점)
     * 4. 1월부터 12월까지 순회하며 월별 손익 집계
     * 5. 최신순으로 정렬하여 반환
     *
     * [월별 집계]
     * - 월간손익 = 해당 월의 일일손익 누적
     * - 월간수익률 = 월간손익 / 월초 자산 × 100
     *
     * @param member 대상 회원
     * @param year 연도
     * @return 월별 투자손익 응답
     */
    public MonthlyProfitResponse getMonthlyProfit(Member member, int year) {
        // 해당 연도 전체 일별 데이터 조회
        List<AccountHistory> yearHistories = accountRepository.findByMemberAndYear(member, year);

        if (yearHistories.isEmpty()) {
            return MonthlyProfitResponse.empty();
        }

        // 월별로 그룹핑 (key: 월, value: 해당 월의 일별 데이터 리스트)
        Map<Integer, List<AccountHistory>> byMonth = yearHistories.stream()
                .collect(Collectors.groupingBy(h -> h.getSnapshotDate().getMonthValue()));

        // 연도 시작 전 마지막 스냅샷 조회 (누적 계산 기준점)
        LocalDate yearStart = LocalDate.of(year, 1, 1);
        Optional<AccountHistory> prevYearHistory = accountRepository
                .findTopByMemberAndSnapshotDateBeforeOrderBySnapshotDateDesc(member, yearStart);

        long initialTotalAsset = prevYearHistory.map(AccountHistory::getTotalAsset)
                .orElse(yearHistories.get(0).getTotalAsset());

        // 월별 집계
        long cumulativePL = 0L;         // 연초부터 누적 손익
        long totalAssetSum = 0L;        // 평균 자산 계산용
        List<MonthlyProfitItem> items = new ArrayList<>();

        for (int month = 1; month <= 12; month++) {
            List<AccountHistory> monthData = byMonth.get(month);
            if (monthData == null || monthData.isEmpty()) continue;  // 데이터 없는 월 스킵

            // 해당 월의 일일손익 합계 = 월간손익
            long monthlyPL = monthData.stream().mapToLong(AccountHistory::getDailyProfitLoss).sum();

            // 누적 손익에 월간손익 추가
            cumulativePL += monthlyPL;

            // 월 평균 자산 (평균 투자금액 계산용)
            totalAssetSum += monthData.stream().mapToLong(AccountHistory::getTotalAsset).sum() / monthData.size();

            // DTO 변환 (내부에서 월간수익률, 입출금 집계 등 처리)
            items.add(MonthlyProfitItem.fromEntities(year, month, monthData, cumulativePL, initialTotalAsset));
        }

        // 최신순 정렬 (12월 → 1월)
        Collections.reverse(items);

        // 요약 정보 생성
        InvestmentProfitSummary summary = InvestmentProfitSummary.of(
                year + "-01-01",
                year + "-12-31",
                cumulativePL,
                calculateRate(cumulativePL, initialTotalAsset),
                items.isEmpty() ? 0L : totalAssetSum / items.size()
        );

        return MonthlyProfitResponse.of(summary, items);
    }

    // ============================================
    // 연도별 조회
    // ============================================

    /**
     * 전체 기간의 연도별 투자손익을 조회.
     *
     * 1. 전체 일별 데이터 조회 (날짜순)
     * 2. 연도별로 그룹핑
     * 3. 첫 번째 스냅샷을 기준점으로 설정
     * 4. 연도순으로 순회하며 연간 손익 집계
     * 5. 최신순으로 정렬하여 반환
     *
     * @param member 대상 회원
     * @return 연도별 투자손익 응답
     */
    public YearlyProfitResponse getYearlyProfit(Member member) {
        // 전체 데이터 조회 (날짜순)
        List<AccountHistory> allHistories = accountRepository.findByMemberOrderBySnapshotDateAsc(member);

        if (allHistories.isEmpty()) {
            return YearlyProfitResponse.empty();
        }

        // 연도별 그룹핑
        Map<Integer, List<AccountHistory>> byYear = allHistories.stream()
                .collect(Collectors.groupingBy(h -> h.getSnapshotDate().getYear()));

        // 첫 스냅샷 자산을 기준점으로 설정
        long initialTotalAsset = allHistories.get(0).getTotalAsset();

        long cumulativePL = 0L;
        List<YearlyProfitItem> items = new ArrayList<>();

        // 연도순 정렬 후 순회
        List<Integer> sortedYears = new ArrayList<>(byYear.keySet());
        Collections.sort(sortedYears);

        for (Integer year : sortedYears) {
            List<AccountHistory> yearData = byYear.get(year);

            // 연간 손익 = 해당 연도 일일손익 합계
            long yearlyPL = yearData.stream().mapToLong(AccountHistory::getDailyProfitLoss).sum();
            cumulativePL += yearlyPL;

            items.add(YearlyProfitItem.fromEntities(year, yearData, cumulativePL, initialTotalAsset));
        }

        // 최신순 정렬
        Collections.reverse(items);

        // 요약 정보
        AccountHistory first = allHistories.get(0);
        AccountHistory last = allHistories.get(allHistories.size() - 1);

        InvestmentProfitSummary summary = InvestmentProfitSummary.of(
                first.getSnapshotDate().toString(),
                last.getSnapshotDate().toString(),
                cumulativePL,
                calculateRate(cumulativePL, initialTotalAsset),
                last.getTotalAsset()
        );

        return YearlyProfitResponse.of(summary, items);
    }

    // ============================================
    // 트레이딩 지표
    // ============================================

    /**
     * 전체 기간의 트레이딩 성과 지표를 계산.
     *
     * - 일별 기준 (AccountHistory): MDD, 총 수익률, 연환산 수익률, 거래일수
     * - 건당 기준 (TradingStatistics): 최대 수익률, 최대 손실률, 승률, 수익/손실 거래 수
     *
     * @param member 대상 회원
     * @return 트레이딩 지표 응답
     */
    public TradingMetricsResponse getTradingMetrics(Member member) {
        List<AccountHistory> allHistories = accountRepository.findByMemberOrderBySnapshotDateAsc(member);

        // 건당 통계 조회
        TradingStatistics tradeStats = tradingStatisticsService.getStatistics(member);

        if (allHistories.isEmpty()) {
            // 일별 데이터 없어도 건당 통계는 있을 수 있음
            return TradingMetricsResponse.builder()
                    .totalProfitRate(BigDecimal.ZERO)
                    .annualizedReturn(BigDecimal.ZERO)
                    .maxDrawdown(BigDecimal.ZERO)
                    .maxDrawdownDate("")
                    .tradingStartDate("")
                    .tradingDays(0)
                    .totalInvested(0L)
                    .currentAsset(0L)
                    .totalProfitLoss(0L)
                    // 건당 지표
                    .maxProfitRate(tradeStats.getMaxProfitRate())
                    .maxLossRate(tradeStats.getMaxLossRate())
                    .totalTrades(tradeStats.getTotalTrades())
                    .winningTrades(tradeStats.getWinningTrades())
                    .losingTrades(tradeStats.getLosingTrades())
                    .winRate(tradeStats.getWinRate())
                    .build();
        }

        AccountHistory first = allHistories.get(0);  // 첫 스냅샷
        AccountHistory last = allHistories.get(allHistories.size() - 1);  // 마지막 스냅샷

        // === 일별 기준 지표 계산 ===

        // 총 손익 = 모든 일일손익의 합
        long totalPL = allHistories.stream().mapToLong(AccountHistory::getDailyProfitLoss).sum();

        // 총 입금액
        long totalDeposit = allHistories.stream().mapToLong(AccountHistory::getDeposit).sum();

        int tradingDays = allHistories.size();  // 총 거래일수
        long daysBetween = ChronoUnit.DAYS.between(first.getSnapshotDate(), last.getSnapshotDate()) + 1;

        // === 전략 에쿼티 기반 MDD (Maximum Drawdown) 계산 ===
        /**
         * 계좌 잔고가 아니라, 입출금을 제거한 “전략 에쿼티 곡선”을 기준으로 MDD를 계산하는 방식.
         *
         * 처리 흐름 요약:
         *
         *   1) 매일의 기록에서 “총자산 / 입금 / 출금 / 순수 전략 손익” 정보를 가져온다.
         *   2) 이를 이용해 “전날 전략 기준 자산”을 역산한다.
         *      → 오늘 자산에서 전략 손익과 입출금을 모두 빼면 전날 기준 금액이 된다.
         *   3) 전날 자산 대비 오늘 전략 손익이 몇 %인지 계산해 하루 전략 수익률을 만든다.
         *   4) 하루 전략 수익률을 누적 곱하여
         *      1.0에서 시작하는 “전략 전용 에쿼티 곡선”을 만든다.
         *      → 입출금과 상관없이 전략 성능만 반영된 그래프
         *   5) 이 전략 에쿼티 곡선에서
         *      고점 대비 가장 크게 떨어진 구간을 찾아 MDD로 기록한다.
         */
        BigDecimal maxDrawdown = BigDecimal.ZERO;
        String maxDrawdownDate = "";
        BigDecimal equity = BigDecimal.ONE;      // 전략 지수 시작값 (1.0 = 100%에서 시작한다고 생각하면 됨)
        BigDecimal peakEquity = BigDecimal.ONE;  // 지금까지 전략 지수가 기록한 최고값

        for (AccountHistory h : allHistories) {
            long totalAsset = h.getTotalAsset();                       // 오늘 기준 계좌 총자산
            long cashFlow = h.getDeposit() - h.getWithdrawal();        // 오늘 하루 순입출금 (입금 +, 출금 -)
            long pnl = h.getDailyProfitLoss();                         // 오늘 전략으로 실제로 벌거나 잃은 금액

            // "전날 전략 기준으로 계좌에 얼마가 있었는지" 역산
            // 오늘 자산에서, 오늘 전략 손익과 오늘 입출금을 모두 빼면
            // 전략이 작동하기 직전에 계좌에 있었던 금액(전날 기준 자산)을 추정할 수 있다.
            long prevAsset = totalAsset - pnl - cashFlow;

            // 전날 기준 자산이 0 이하라면,
            // 수익률(몇 % 올랐는지/떨어졌는지)을 계산해도 의미가 없으므로 해당 일자는 스킵
            if (prevAsset <= 0) {
                continue;
            }

            // 오늘 전략 손익이 "전날 기준 자산" 대비 몇 %인지 계산 (하루 수익률)
            BigDecimal periodReturn = BigDecimal.valueOf(pnl)
                    .divide(BigDecimal.valueOf(prevAsset), 8, RoundingMode.HALF_UP);

            // 전략 지수 업데이트
            // 전날 전략 지수에 (1 + 하루 수익률)을 곱해서 오늘 전략 지수를 만든다.
            equity = equity.multiply(BigDecimal.ONE.add(periodReturn));

            // 지금까지 중에서 전략 지수가 가장 높았던 시점을 고점으로 기록
            if (equity.compareTo(peakEquity) > 0) {
                peakEquity = equity;
            }

            // 현재 시점에서의 하락률 계산
            // "지금 전략 지수가, 과거 최고점 대비 얼마나 떨어져 있는지"를 %로 구한다.
            if (peakEquity.compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal drawdown = equity.subtract(peakEquity)
                        .divide(peakEquity, 6, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100));

                // drawdown은 보통 음수 값이고,
                // 이 값이 가장 작을수록(즉, 가장 많이 떨어졌을수록) MDD가 커진다.
                if (drawdown.compareTo(maxDrawdown) < 0) {
                    maxDrawdown = drawdown;
                    maxDrawdownDate = h.getSnapshotDate().toString();
                }
            }
        }



        // === 연환산 수익률 계산 ===
        BigDecimal annualizedReturn = BigDecimal.ZERO;
        if (daysBetween > 0 && first.getTotalAsset() > 0) {
            double dailyReturn = totalPL / (double) first.getTotalAsset() / daysBetween;
            annualizedReturn = BigDecimal.valueOf(dailyReturn * 365 * 100).setScale(4, RoundingMode.HALF_UP);
        }

        // === 응답 생성 (일별 + 건당 지표 병합) ===
        return TradingMetricsResponse.builder()
                // 일별 지표
                .totalProfitRate(calculateRate(totalPL, first.getTotalAsset()))
                .annualizedReturn(annualizedReturn)
                .maxDrawdown(maxDrawdown)
                .maxDrawdownDate(maxDrawdownDate)
                .tradingStartDate(first.getSnapshotDate().toString())
                .tradingDays(tradingDays)
                .totalInvested(first.getTotalAsset() + totalDeposit)
                .currentAsset(last.getTotalAsset())
                .totalProfitLoss(totalPL)
                // 건당 지표 (TradingStatistics)
                .maxProfitRate(tradeStats.getMaxProfitRate())
                .maxLossRate(tradeStats.getMaxLossRate())
                .totalTrades(tradeStats.getTotalTrades())
                .winningTrades(tradeStats.getWinningTrades())
                .losingTrades(tradeStats.getLosingTrades())
                .winRate(tradeStats.getWinRate())
                .build();
    }

    /**
     * 데이터가 존재하는 연도 목록을 조회.
     *
     * @param member 대상 회원
     * @return 연도 목록 (최신순)
     */
    public List<Integer> getAvailableYears(Member member) {
        return accountRepository.findByMemberOrderBySnapshotDateAsc(member).stream()
                .map(h -> h.getSnapshotDate().getYear())
                .distinct()
                .sorted(Comparator.reverseOrder())  // 최신순 정렬
                .collect(Collectors.toList());
    }

    // ============================================
    // 유틸리티 메서드
    // ============================================

    /**
     * 수익률을 계산.
     *
     * 공식: 손익 / 기준자산 × 100
     *
     * @param profitLoss 손익 금액
     * @param baseAsset 기준 자산 (분모)
     * @return 수익률 (%, 소수점 4자리)
     */
    private BigDecimal calculateRate(long profitLoss, long baseAsset) {
        if (baseAsset <= 0) return BigDecimal.ZERO;
        return BigDecimal.valueOf(profitLoss * 100)
                .divide(BigDecimal.valueOf(baseAsset), 4, RoundingMode.HALF_UP);
    }
}
