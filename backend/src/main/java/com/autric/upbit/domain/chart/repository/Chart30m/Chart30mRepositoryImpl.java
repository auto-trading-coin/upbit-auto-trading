package com.autric.upbit.domain.chart.repository.Chart30m;

import com.autric.upbit.domain.chart.entity.Chart30m;
import com.autric.upbit.domain.chart.entity.QChart30m;
import com.autric.upbit.domain.chart.entity.QMarket;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;

import java.util.List;

@RequiredArgsConstructor
public class Chart30mRepositoryImpl implements Chart30mRepositoryCustom{

    private final JPAQueryFactory queryFactory;

    @Override
    public List<Chart30m> findLatestByMarket(String marketCode, int limit) {
        QChart30m c = QChart30m.chart30m;
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
    public List<Chart30m> findByMarketBefore(String marketCode, Long beforeTimestamp, int limit) {
        QChart30m c = QChart30m.chart30m;
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
