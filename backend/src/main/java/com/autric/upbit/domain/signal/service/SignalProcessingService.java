package com.autric.upbit.domain.signal.service;

import com.autric.upbit.domain.chart.entity.Market;
import com.autric.upbit.domain.chart.service.MarketService;
import com.autric.upbit.domain.member.entity.Member;
import com.autric.upbit.domain.member.service.MemberService;
import com.autric.upbit.domain.order.entity.Orders;
import com.autric.upbit.domain.order.service.OrderService;
import com.autric.upbit.domain.signal.entity.Signals;
import com.autric.upbit.domain.strategy.entity.Strategy;
import com.autric.upbit.domain.strategy.service.StrategyService;
import com.autric.upbit.domain.trade.service.TradingStatisticsService;
import com.autric.upbit.domain.upbitApiKey.UpbitApiKey;
import com.autric.upbit.external.kafka.dto.SignalMessage;
import com.autric.upbit.external.upbit.client.UpbitApiClient;
import com.autric.upbit.external.upbit.dto.response.UpbitAccountResponse;
import com.autric.upbit.external.upbit.dto.response.UpbitOrderResponse;
import com.autric.upbit.external.upbit.dto.response.UpbitTradePriceResponse;
import com.autric.upbit.external.upbit.dto.response.UpbitTradeResponse;
import com.autric.upbit.external.upbit.service.UpbitOrderCalculatorService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;

@Service
@Slf4j
@RequiredArgsConstructor
public class SignalProcessingService {

    private final UpbitApiClient upbitApiClient;
    private final UpbitOrderCalculatorService upbitOrderCalculatorService;
    private final MemberService memberService;
    private final StrategyService strategyService;
    private final MarketService marketService;
    private final SignalService signalService;
    private final OrderService orderService;
    private final TradingStatisticsService tradingStatisticsService;
    private final ExecutorService orderExecutor;

    public void process(SignalMessage msg) {
        if (!strategyService.existsById(msg.getStrategy())) {
            log.warn("존재하지 않는 전략입니다: {}", msg.getStrategy());
            return;
        }

        // 자동매매가 활성되었고, 선택한 전략이 시그널 메세지와 일치하는 회원 조회
        List<Member> members = memberService.getActiveSubscribers(msg.getStrategy());

        // 메세지에 해당하는 전략,Market 조회 후 Signal 정보 저장
        Strategy strategy = strategyService.getStrategy(msg.getStrategy());
        Market market = marketService.getMarketByCoin(msg.getMarket());
        Signals signal = signalService.createSignal(msg, market, strategy);

        // 현재 처리할 코인의 시세 확인
        UpbitTradePriceResponse priceRes = upbitApiClient.getCurrentPrice(msg.getMarket());
        BigDecimal curPrice = priceRes.getTradePrice();

        // 각 회원의 주문을 비동기로 실행함으로써 병렬 처리
        List<CompletableFuture<Void>> futures = members.stream()
                .map(member -> CompletableFuture.runAsync(
                        () -> processOrderForMember(member, msg, market, signal, curPrice),
                        orderExecutor))
                .toList();

        // 모든 주문 완료 대기
        CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).join();
    }

    /**
     * 회원별 주문 처리
     */
    private void processOrderForMember(Member member, SignalMessage msg,
            Market market, Signals signal, BigDecimal curPrice) {
        UpbitApiKey apiKey = member.getUpbitApiKey();
        if (apiKey == null) {
            log.warn("Member {} has no API key", member.getId());
            return;
        }

        try {
            List<UpbitAccountResponse> accounts = upbitApiClient.getAccounts(
                    apiKey.getAccessKey(), apiKey.getSecretKey());

            // 매수 시그널인데 이미 해당 코인을 보유 중이면 스킵
            if (msg.getSide().equals("bid") && isAlreadyHolding(accounts, msg.getMarket())) {
                log.info("Member {} - 이미 진입 중인 코인, 매수 스킵: {}", member.getId(), msg.getMarket());
                return;
            }

            // 다중 코인 진입을 위한 주문 금액 계산 (Market 테이블 기준)
            List<String> targetCoins = marketService.getAllCoins();
            String price = upbitOrderCalculatorService.getPrice(accounts, targetCoins);
            String volume = upbitOrderCalculatorService.getVolume(accounts, msg.getMarket(), curPrice);

            // 주문 자산이 부족(5천원 미만)하거나, 매도 수량이 부족할 경우 스킵
            if ((msg.getSide().equals("bid") && price == null) ||
                    (msg.getSide().equals("ask") && volume == null)) {
                return;
            }

            UpbitOrderResponse res = upbitApiClient.upbitOrder(
                    apiKey.getAccessKey(), apiKey.getSecretKey(), msg.getMarket(),
                    msg.getSide(), price, volume);

            // 조건부 폴링 적용 -> 주문이 미체결 상태일 때 폴링을 통해 체결 상태 확인
            if (!"done".equals(res.getState())) {
                res = pollOrderUntilDone(apiKey.getAccessKey(), apiKey.getSecretKey(), res.getUuid());
            }

            // 체결 내역 기반 계산 (가중 평균)
            if (res.getTrades() != null && !res.getTrades().isEmpty()) {
                BigDecimal totalVolume = BigDecimal.ZERO;
                BigDecimal totalFunds = BigDecimal.ZERO;

                for (UpbitTradeResponse trade : res.getTrades()) {
                    totalVolume = totalVolume.add(new BigDecimal(trade.getVolume()));
                    totalFunds = totalFunds.add(new BigDecimal(trade.getFunds()));
                }

                if (totalVolume.compareTo(BigDecimal.ZERO) > 0) {
                    BigDecimal avgPrice = totalFunds.divide(totalVolume, 8, RoundingMode.HALF_UP);
                    res.setPrice(avgPrice.toPlainString());
                    res.setVolume(totalVolume.toPlainString());
                    res.setExecutedVolume(totalVolume.toPlainString());
                }
            }

            log.info("Member {} trade success: market={}, executed_volume={}, price={}, uuid={}, ordType={}",
                    member.getId(), res.getMarket(), res.getExecutedVolume(), res.getPrice(),
                    res.getUuid(), res.getOrdType());

            // 주문 저장
            Orders savedOrder = orderService.createOrder(res.toOrderEntity(market, member, signal));

            // 매도 완료 시 거래 통계 업데이트
            if (msg.getSide().equals("ask")) {
                tradingStatisticsService.updateOnSell(member, market, savedOrder);
            }

        } catch (Exception e) {
            // 개별 실패가 전체에 영향 주지 않도록 로깅만 수행
            log.error("Member {} market order FAILED: {}", member.getId(), e.getMessage(), e);
        }
    }

    /**
     * 조건부 폴링: 체결될 때까지 주문 상태 조회
     * 
     * @param accessKey 업비트 API Access Key
     * @param secretKey 업비트 API Secret Key
     * @param uuid      주문 UUID
     * @return 체결된 주문 정보
     */
    private UpbitOrderResponse pollOrderUntilDone(String accessKey, String secretKey, String uuid) {
        int maxAttempts = 10;
        int delayMs = 50;  // 폴링으로 인해 최대 500ms(10*50) 지연 발생 가능

        for (int i = 0; i < maxAttempts; i++) {
            UpbitOrderResponse order = upbitApiClient.getOrder(accessKey, secretKey, uuid);

            if (!"wait".equals(order.getState())) {
                return order;
            }

            try {
                Thread.sleep(delayMs);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                return order;
            }
        }

        log.warn("주문 체결 대기 타임아웃: {}", uuid);
        return upbitApiClient.getOrder(accessKey, secretKey, uuid);
    }

    /**
     * 해당 코인을 이미 보유 중인지 확인
     *
     * @param accounts 업비트 계좌 잔고
     * @param market   확인할 마켓 (ex: KRW-BTC)
     * @return 보유 중이면 true
     */
    private boolean isAlreadyHolding(List<UpbitAccountResponse> accounts, String market) {
        String targetCurrency = market.split("-")[1];

        for (UpbitAccountResponse account : accounts) {
            if (targetCurrency.equals(account.getCurrency())) {
                BigDecimal balance = new BigDecimal(account.getBalance());
                BigDecimal locked = new BigDecimal(account.getLocked() == null ? "0" : account.getLocked());
                BigDecimal total = balance.add(locked);

                return total.compareTo(BigDecimal.ZERO) > 0;
            }
        }
        return false;
    }
}
