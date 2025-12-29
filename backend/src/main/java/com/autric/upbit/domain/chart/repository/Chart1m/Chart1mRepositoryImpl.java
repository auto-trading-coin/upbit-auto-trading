package com.autric.upbit.domain.chart.repository.Chart1m;

import com.autric.upbit.domain.chart.entity.*;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;

import java.util.List;

@RequiredArgsConstructor
public class Chart1mRepositoryImpl implements Chart1mRepositoryCustom{

    private final JPAQueryFactory queryFactory;

    @Override
    public List<Chart1m> findLatestByMarket(String marketCode, int limit) {
        QChart1m c = QChart1m.chart1m;
        QMarket m = QMarket.market;

        return queryFactory
                .selectFrom(c)
                .join(c.market, m).fetchJoin()
                .where(c.market.coin.eq(marketCode))
                .orderBy(c.candleDateTimeKst.desc())
                .limit(limit)
                .fetch();
    }

    @Override
    public List<Chart1m> findByMarketBefore(String marketCode, Long beforeTimestamp, int limit) {
        QChart1m c = QChart1m.chart1m;
        QMarket m = QMarket.market;

        return queryFactory
                .selectFrom(c)
                .join(c.market, m).fetchJoin()
                .where(
                        c.market.coin.eq(marketCode),
                        c.timestamp.lt(beforeTimestamp)
                )
                .orderBy(c.candleDateTimeKst.desc())
                .limit(limit)
                .fetch();
    }
}
