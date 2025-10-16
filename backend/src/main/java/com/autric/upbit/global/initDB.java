package com.autric.upbit.global;

import com.autric.upbit.domain.chart.entity.Market;
import com.autric.upbit.domain.strategy.entity.Strategy;
import jakarta.annotation.PostConstruct;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import com.autric.upbit.domain.strategy.entity.StrategyType;

@Component
@RequiredArgsConstructor
public class initDB {

    private final InitService initService;

    @PostConstruct
    public void init() {
        initService.initMarketData();
        initService.initStrategyData();
    }

    @Component
    @Transactional
    @RequiredArgsConstructor
    static class InitService {

        private final EntityManager em;

        public void initMarketData() {
            // Market 데이터가 이미 있으면 skip
            Long marketCount = em.createQuery("SELECT COUNT(m) FROM Market m", Long.class)
                    .getSingleResult();

            if(marketCount > 0) {
                System.out.println("initDB → Market 데이터가 이미 존재 → 초기화 생략");
                return;
            }

            // 초기 Market 데이터 정의
            Market btc = Market.builder().coin("KRW-BTC").build();
            Market eth = Market.builder().coin("KRW-ETH").build();
            Market xrp = Market.builder().coin("KRW-XRP").build();
            Market sol = Market.builder().coin("KRW-SOL").build();
            Market doge = Market.builder().coin("KRW-DOGE").build();

            // DB에 저장
            em.persist(btc);
            em.persist(eth);
            em.persist(xrp);
            em.persist(sol);
            em.persist(doge);

            System.out.println("initDB → Market 초기 데이터 insert 완료 → 건수: 5");
        }

        public void initStrategyData() {
            // Market 데이터가 이미 있으면 skip
            Long strategyCount = em.createQuery("SELECT COUNT(m) FROM Strategy m", Long.class)
                    .getSingleResult();

            if(strategyCount > 0) {
                System.out.println("initDB → Strategy 데이터가 이미 존재 → 초기화 생략");
                return;
            }

            // 1. RSI 전략
            Strategy rsiStrategy = Strategy.builder()
                    .conditions("RSI < 30 (oversold) or RSI > 70 (overbought)")
                    .information("RSI 지표가 30 이하로 과매도 상태일 때 매수, 70 이상 과매수 상태일 때 매도하는 전략")
                    .name("RSI 과매도/과매수 전략")
                    .strategyType(StrategyType.MEAN_REVERSION)
                    .build();

            // 2. EMA Cross 전략
            Strategy emaStrategy = Strategy.builder()
                    .conditions("Fast EMA(9) > Slow EMA(21)")
                    .information("단기(9) EMA가 장기(21) EMA를 상향 돌파할 때 매수, 하향 돌파할 때 매도하는 전략")
                    .name("EMA 크로스 전략")
                    .strategyType(StrategyType.TREND_FOLLOWING)
                    .build();

            // 3. Three Soldiers 전략
            Strategy threeSoldiersStrategy = Strategy.builder()
                    .conditions("3연속 양봉 & MA30 상승 & MA200 상승")
                    .information("3개의 연속 상승 캔들(삼병)과 단기/장기 이동평균선 상승을 확인하여 매수, 3연속 음봉과 이평선 하락 시 매도하는 전략")
                    .name("삼병 추세 전략")
                    .strategyType(StrategyType.TREND_FOLLOWING)
                    .build();

            // DB에 저장
            em.persist(rsiStrategy);
            em.persist(emaStrategy);
            em.persist(threeSoldiersStrategy);

            System.out.println("initDB → Strategy 초기 데이터 insert 완료 ");
        }
    }
}
