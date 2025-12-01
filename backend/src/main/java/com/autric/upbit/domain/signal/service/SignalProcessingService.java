package com.autric.upbit.domain.signal.service;

import com.autric.upbit.domain.chart.entity.Market;
import com.autric.upbit.domain.chart.service.MarketService;
import com.autric.upbit.domain.member.entity.Member;
import com.autric.upbit.domain.member.service.MemberService;
import com.autric.upbit.domain.order.service.OrderService;
import com.autric.upbit.domain.signal.entity.Signals;
import com.autric.upbit.domain.strategy.entity.Strategy;
import com.autric.upbit.domain.strategy.service.StrategyService;
import com.autric.upbit.domain.upbitApiKey.UpbitApiKey;
import com.autric.upbit.external.kafka.dto.SignalMessage;
import com.autric.upbit.external.upbit.client.UpbitApiClient;
import com.autric.upbit.external.upbit.dto.response.UpbitAccountResponse;
import com.autric.upbit.external.upbit.dto.response.UpbitOrderResponse;
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

        for (Member m : members) {
            UpbitApiKey apiKey = m.getUpbitApiKey();
            if (apiKey == null) {
                log.warn("Member {} has no API key", m.getId());
                continue;
            }

            try {
                List<UpbitAccountResponse> accounts = upbitApiClient.getAccounts(apiKey.getAccessKey(),
                        apiKey.getSecretKey());

                String price = upbitOrderCalculatorService.getPrice(accounts);
                String volume = upbitOrderCalculatorService.getVolume(accounts, msg.getMarket());

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

                orderService.createOrder(res.toOrderEntity(market, m, signal));

            } catch (Exception e) {
                log.error("Member {} market buy FAILED: {}", m.getId(), e.getMessage(), e);
                throw e;
            }

        }
    }
}
