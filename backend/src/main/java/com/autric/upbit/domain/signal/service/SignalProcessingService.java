package com.autric.upbit.domain.signal.service;

import com.autric.upbit.domain.chart.entity.Market;
import com.autric.upbit.domain.chart.service.MarketService;
import com.autric.upbit.domain.member.entity.Member;
import com.autric.upbit.domain.member.service.MemberService;
import com.autric.upbit.domain.order.service.OrderService;
import com.autric.upbit.domain.signal.entity.Signals;
import com.autric.upbit.domain.strategy.entity.Strategy;
import com.autric.upbit.domain.strategy.service.StrategyService;
import com.autric.upbit.external.kafka.dto.SignalMessage;
import com.autric.upbit.external.upbit.client.UpbitApiClient;
import com.autric.upbit.external.upbit.dto.response.UpbitAccountResponse;
import com.autric.upbit.external.upbit.dto.response.UpbitOrderResponse;
import com.autric.upbit.external.upbit.service.UpbitOrderCalculatorService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

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
            List<UpbitAccountResponse> accounts = upbitApiClient.getAccounts(m.getAccessKey(), m.getSecretKey());

            String price = upbitOrderCalculatorService.getPrice(accounts);
            String volume = upbitOrderCalculatorService.getVolume(accounts, msg.getMarket());

            // 주문 자산이 부족(5천원 미만)하거나, 매도 수량이 부족할 경우 continue
            if((msg.getSide().equals("bid") && price == null) ||
                    (msg.getSide().equals("ask") && volume == null)) continue;

            try {
                UpbitOrderResponse res = upbitApiClient.upbitOrder(
                        m.getAccessKey(), m.getSecretKey(), msg.getMarket(),
                        msg.getSide(), price, volume);
                log.info("Member {} trade success: market={}, executed_volume={}, price={}, uuid={}, ordType={}",
                        m.getId(), res.getMarket(), res.getExecutedVolume(), res.getPrice(), res.getUuid(), res.getOrdType());

                // 주문 결과 저장
                orderService.createOrder(res.toOrderEntity(market, m, signal));

            }
            catch (Exception e){
                log.error("Member {} market buy FAILED: {}", m.getId(), e.getMessage(), e);
                throw e;
                // TODO: 실패 저장/재시도 정책
            }

        }
    }
}
