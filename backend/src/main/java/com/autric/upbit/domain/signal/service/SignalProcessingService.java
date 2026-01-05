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

        for (Member m : members) {
            UpbitApiKey apiKey = m.getUpbitApiKey();
            if (apiKey == null) {
                log.warn("Member {} has no API key", m.getId());
                continue;
            }

            try {
                List<UpbitAccountResponse> accounts = upbitApiClient.getAccounts(apiKey.getAccessKey(),
                        apiKey.getSecretKey());

                // 매수 시그널인데 이미 해당 코인을 보유 중이면 스킵
                if (msg.getSide().equals("bid") && isAlreadyHolding(accounts, msg.getMarket())) {
                    log.info("Member {} - 이미 진입 중인 코인, 매수 스킵: {}", m.getId(), msg.getMarket());
                    continue;
                }

                // 다중 코인 진입을 위한 주문 금액 계산 (Market 테이블 기준)
                List<String> targetCoins = marketService.getAllCoins();
                String price = upbitOrderCalculatorService.getPrice(accounts, targetCoins);
                String volume = upbitOrderCalculatorService.getVolume(accounts, msg.getMarket(), curPrice);

                // 주문 자산이 부족(5천원 미만)하거나, 매도 수량이 부족할 경우 continue
                if ((msg.getSide().equals("bid") && price == null) ||
                        (msg.getSide().equals("ask") && volume == null))
                    continue;

                UpbitOrderResponse res = upbitApiClient.upbitOrder(
                        apiKey.getAccessKey(), apiKey.getSecretKey(), msg.getMarket(),
                        msg.getSide(), price, volume);

                // 잠시 대기 (체결 내역 반영)
                try {
                    Thread.sleep(200);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }

                // 주문 상세 조회 및 체결 내역 기반 계산 (가중 평균)
                try {
                    UpbitOrderResponse orderDetail = upbitApiClient.getOrder(apiKey.getAccessKey(),
                            apiKey.getSecretKey(), res.getUuid());

                    if (orderDetail.getTrades() != null && !orderDetail.getTrades().isEmpty()) {
                        BigDecimal totalVolume = BigDecimal.ZERO;
                        BigDecimal totalFunds = BigDecimal.ZERO;

                        for (UpbitTradeResponse trade : orderDetail.getTrades()) {
                            totalVolume = totalVolume.add(new BigDecimal(trade.getVolume()));
                            totalFunds = totalFunds.add(new BigDecimal(trade.getFunds()));
                        }

                        if (totalVolume.compareTo(BigDecimal.ZERO) > 0) {
                            BigDecimal avgPrice = totalFunds.divide(totalVolume, 8, RoundingMode.HALF_UP); // 소수점 8자리까지

                            res.setPrice(avgPrice.toPlainString());
                            res.setVolume(totalVolume.toPlainString());
                            // executed_volume도 업데이트
                            res.setExecutedVolume(totalVolume.toPlainString());
                        }
                    }
                } catch (Exception e) {
                    log.warn("Failed to fetch order detail for calculation: {}", e.getMessage());
                    // 실패해도 원래 res 값으로 저장 시도
                }

                log.info("Member {} trade success: market={}, executed_volume={}, price={}, uuid={}, ordType={}",
                        m.getId(), res.getMarket(), res.getExecutedVolume(), res.getPrice(), res.getUuid(),
                        res.getOrdType());

                // 주문 저장
                Orders savedOrder = orderService.createOrder(res.toOrderEntity(market, m, signal));

                // 매도 완료 시 거래 통계 업데이트
                if (msg.getSide().equals("ask")) {
                    tradingStatisticsService.updateOnSell(m, market, savedOrder);
                }

            } catch (Exception e) {
                log.error("Member {} market buy FAILED: {}", m.getId(), e.getMessage(), e);
                throw e;
            }

        }
    }

    /**
     * 해당 코인을 이미 보유 중인지 확인
     *
     * @param accounts 업비트 계좌 잔고
     * @param market 확인할 마켓 (ex: KRW-BTC)
     * @return 보유 중이면 true
     */
    private boolean isAlreadyHolding(List<UpbitAccountResponse> accounts, String market) {
        String targetCurrency = market.split("-")[1];  // KRW-BTC → BTC

        for (UpbitAccountResponse account : accounts) {
            if (targetCurrency.equals(account.getCurrency())) {
                BigDecimal balance = new BigDecimal(account.getBalance());
                BigDecimal locked = new BigDecimal(account.getLocked() == null ? "0" : account.getLocked());
                BigDecimal total = balance.add(locked);

                // 잔고가 0보다 크면 보유 중
                return total.compareTo(BigDecimal.ZERO) > 0;
            }
        }
        return false;
    }
}
