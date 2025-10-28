package com.autric.upbit.global;

import com.autric.upbit.domain.chart.entity.Market;
import com.autric.upbit.domain.strategy.entity.Indicator;
import com.autric.upbit.domain.strategy.entity.Strategy;
import com.autric.upbit.domain.strategy.entity.StrategyIndicator;
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
            if(marketCount != 0) return;

            System.out.println("initDB → Market 데이터 초기화 실행");

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
            // Strategy 데이터가 이미 있으면 skip
            Long strategyCount = em.createQuery("SELECT COUNT(m) FROM Strategy m", Long.class)
                    .getSingleResult();
            if(strategyCount != 0) return;

            System.out.println("initDB → Strategy 데이터 초기화 실행");

            // === 1. Indicator 먼저 생성 ===
            Indicator rsiIndicator = Indicator.builder()
                    .name("RSI")
                    .description("Relative Strength Index - 상대강도지수")
                    .build();

            Indicator emaIndicator = Indicator.builder()
                    .name("EMA")
                    .description("Exponential Moving Average - 지수이동평균")
                    .build();

            Indicator smaIndicator = Indicator.builder()
                    .name("SMA")
                    .description("Simple Moving Average - 단순이동평균")
                    .build();

            Indicator threeSoldiersIndicator = Indicator.builder()
                    .name("THREE_SOLDIERS")
                    .description("Three White Soldiers - 삼병 상승 패턴")
                    .build();

            Indicator threeCrowsIndicator = Indicator.builder()
                    .name("THREE_CROWS")
                    .description("Three Black Crows - 흑삼병 하락 패턴")
                    .build();

            em.persist(rsiIndicator);
            em.persist(emaIndicator);
            em.persist(smaIndicator);
            em.persist(threeSoldiersIndicator);
            em.persist(threeCrowsIndicator);

            System.out.println("initDB → Indicator 초기 데이터 insert 완료 → 건수: 5");

            // === 2. Strategy 생성 ===
            Strategy rsiStrategy = Strategy.builder()
                    .name("RSI 과매도/과매수 전략")
                    .information("RSI 지표가 30 이하로 과매도 상태일 때 매수, 70 이상 과매수 상태일 때 매도하는 전략")
                    .conditions("RSI < 30 (oversold) or RSI > 70 (overbought)")
                    .strategyType(StrategyType.MEAN_REVERSION)
                    .build();

            Strategy emaStrategy = Strategy.builder()
                    .name("EMA 크로스 전략")
                    .information("단기(9) EMA가 장기(21) EMA를 상향 돌파할 때 매수, 하향 돌파할 때 매도하는 전략")
                    .conditions("Fast EMA(9) > Slow EMA(21)")
                    .strategyType(StrategyType.TREND_FOLLOWING)
                    .build();

            Strategy threeSoldiersStrategy = Strategy.builder()
                    .name("삼병 추세 전략")
                    .information("3개의 연속 상승 캔들(삼병)과 단기/장기 이동평균선 상승을 확인하여 매수, 3연속 음봉과 이평선 하락 시 매도하는 전략")
                    .conditions("3연속 양봉 & MA30 상승 & MA200 상승")
                    .strategyType(StrategyType.TREND_FOLLOWING)
                    .build();

            em.persist(rsiStrategy);
            em.persist(emaStrategy);
            em.persist(threeSoldiersStrategy);

            System.out.println("initDB → Strategy 초기 데이터 insert 완료 → 건수: 3");

            // === 3. StrategyIndicator 연결 ===
            // RSI 전략 → RSI 지표
            StrategyIndicator rsiLink = StrategyIndicator.builder()
                    .strategy(rsiStrategy)
                    .indicator(rsiIndicator)
                    .build();
            em.persist(rsiLink);

            // EMA 전략 → EMA 지표
            StrategyIndicator emaLink = StrategyIndicator.builder()
                    .strategy(emaStrategy)
                    .indicator(emaIndicator)
                    .build();
            em.persist(emaLink);

            // Three Soldiers 전략 → SMA, THREE_SOLDIERS, THREE_CROWS 지표
            StrategyIndicator threeSoldiersLink1 = StrategyIndicator.builder()
                    .strategy(threeSoldiersStrategy)
                    .indicator(smaIndicator)
                    .build();

            StrategyIndicator threeSoldiersLink2 = StrategyIndicator.builder()
                    .strategy(threeSoldiersStrategy)
                    .indicator(threeSoldiersIndicator)
                    .build();

            StrategyIndicator threeSoldiersLink3 = StrategyIndicator.builder()
                    .strategy(threeSoldiersStrategy)
                    .indicator(threeCrowsIndicator)
                    .build();

            em.persist(threeSoldiersLink1);
            em.persist(threeSoldiersLink2);
            em.persist(threeSoldiersLink3);

            System.out.println("initDB → StrategyIndicator 연결 완료 → 건수: 5");
        }
    }
}
