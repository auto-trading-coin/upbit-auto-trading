package com.autric.upbit.domain.chart.repository.Chart5m;

import com.autric.upbit.domain.chart.entity.Chart5m;
import com.autric.upbit.domain.chart.entity.QChart5m;
import com.autric.upbit.domain.chart.entity.QMarket;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;

import java.util.List;

@RequiredArgsConstructor
public class Chart5mRepositoryImpl implements Chart5mRepositoryCustom{

    private final JPAQueryFactory queryFactory;

    @Override
    public List<Chart5m> findLatestByMarket(String marketCode, int limit) {
        QChart5m c = QChart5m.chart5m;
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
    public List<Chart5m> findByMarketBefore(String marketCode, Long beforeTimestamp, int limit) {
        QChart5m c = QChart5m.chart5m;
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
