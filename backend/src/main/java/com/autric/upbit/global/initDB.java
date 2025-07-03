package com.autric.upbit.global;

import com.autric.upbit.domain.chart.entity.Market;
import jakarta.annotation.PostConstruct;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
public class initDB {

    private final InitService initService;

    @PostConstruct
    public void init() {
        initService.initMarketData();
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
    }
}
