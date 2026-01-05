package com.autric.upbit.external.upbit.service;

import com.autric.upbit.external.upbit.client.UpbitApiClient;
import com.autric.upbit.external.upbit.dto.response.UpbitAccountResponse;
import com.autric.upbit.external.upbit.dto.response.UpbitTradePriceResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class UpbitOrderCalculatorService {

    private final UpbitApiClient upbitApiClient;

    private static final BigDecimal MIN_ORDER_AMOUNT = new BigDecimal("5000");
    private static final BigDecimal FEE_RATE = new BigDecimal("0.9995"); // 수수료 0.05% 제외

    public String getVolume(List<UpbitAccountResponse> accounts, String market, BigDecimal curPrice) {
        String baseCurrency = market.split("-")[1];

        for (UpbitAccountResponse dto : accounts) {
            if (baseCurrency.equals(dto.getCurrency())) {
                BigDecimal balance = new BigDecimal(dto.getBalance());
                BigDecimal locked = new BigDecimal(dto.getLocked() == null ? "0" : dto.getLocked());

                // 가용할 수 있는 코인 수량
                BigDecimal available = balance.subtract(locked);
                if (available.compareTo(BigDecimal.ZERO) <= 0) return null;

                // 현재 보유한 코인의 수량 * 시세 (5천원 이상이어야 함)
                BigDecimal price = available.multiply(curPrice);

                // 매도 주문이 가능한 수량의 가치가 5천원 미만이라면 null 리턴
                if (price.compareTo(MIN_ORDER_AMOUNT) <= 0) return null;

                return available.toPlainString();
            }
        }
        return null;
    }

    /**
     * 다중 코인 진입을 위한 매수 금액 계산
     * 
     * 공식: O = K / (n - m)
     * - K: 가용 원화
     * - n: 투자 대상 코인 수 (targetCoins.size())
     * - m: 현재 진입 중인 코인 수
     * 
     * @param accounts 업비트 계좌 잔고 목록
     * @param targetCoins 자동매매 대상 코인 목록 (Market 테이블)
     * @return 주문 금액 (원화) 또는 null (주문 불가 시)
     */
    public String getPrice(List<UpbitAccountResponse> accounts, List<String> targetCoins) {
        BigDecimal availableKrw = getAvailableKrw(accounts);
        if (availableKrw == null || availableKrw.compareTo(BigDecimal.ZERO) <= 0) {
            return null;
        }

        int n = targetCoins.size();  // 투자 대상 코인 수
        int m = countEnteredCoins(accounts, targetCoins);  // 현재 진입 중인 코인 수
        int remainingSlots = n - m;

        log.info("다중 코인 진입 계산: n={}, m={}, 남은 슬롯={}, 가용 KRW={}", 
                n, m, remainingSlots, availableKrw);

        if (remainingSlots <= 0) {
            log.info("진입 가능한 슬롯 없음 (n={}, m={})", n, m);
            return null;
        }

        // 주문 금액 = 가용 원화 / 남은 슬롯
        BigDecimal orderAmount = availableKrw
                .divide(BigDecimal.valueOf(remainingSlots), 0, RoundingMode.DOWN)
                .multiply(FEE_RATE)
                .setScale(0, RoundingMode.DOWN);

        // 최소 주문금액 체크
        if (orderAmount.compareTo(MIN_ORDER_AMOUNT) < 0) {
            log.info("최소 주문금액 미달: {}원 < 5000원", orderAmount);
            return null;
        }

        log.info("계산된 주문 금액: {}원", orderAmount);
        return orderAmount.toPlainString();
    }

    /**
     * 가용 원화(KRW) 조회
     */
    private BigDecimal getAvailableKrw(List<UpbitAccountResponse> accounts) {
        for (UpbitAccountResponse dto : accounts) {
            if ("KRW".equals(dto.getCurrency())) {
                BigDecimal balance = new BigDecimal(dto.getBalance());
                BigDecimal locked = new BigDecimal(dto.getLocked() == null ? "0" : dto.getLocked());
                return balance.subtract(locked);
            }
        }
        return null;
    }

    /**
     * 현재 진입 중인 코인 수 계산 (targetCoins 기준)
     * 
     * @param accounts 업비트 계좌 잔고
     * @param targetCoins 자동매매 대상 코인 목록
     * @return 진입 중인 코인 수 (m)
     */
    private int countEnteredCoins(List<UpbitAccountResponse> accounts, List<String> targetCoins) {
        int count = 0;

        for (UpbitAccountResponse account : accounts) {
            String currency = account.getCurrency();
            
            // KRW는 제외
            if ("KRW".equals(currency)) continue;

            // 해당 코인이 targetCoins에 포함되어 있는지 확인
            String market = "KRW-" + currency;
            if (!targetCoins.contains(market)) continue;

            // 잔고가 있는지 확인 (최소 주문금액 가치 이상)
            BigDecimal balance = new BigDecimal(account.getBalance());
            BigDecimal locked = new BigDecimal(account.getLocked() == null ? "0" : account.getLocked());
            BigDecimal total = balance.add(locked);

            if (total.compareTo(BigDecimal.ZERO) > 0) {
                count++;
                // log.debug("진입 중인 코인 발견: {} (보유량: {})", market, total);
            }
        }

        return count;
    }
}
