package com.autric.upbit.domain.chart.repository.Chart60m;

import com.autric.upbit.domain.chart.entity.Chart60m;
import com.autric.upbit.domain.chart.entity.QChart60m;
import com.autric.upbit.domain.chart.entity.QMarket;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;

import java.util.List;

@RequiredArgsConstructor
public class Chart60mRepositoryImpl implements Chart60mRepositoryCustom{

    private final JPAQueryFactory queryFactory;

    @Override
    public List<Chart60m> findLatestByMarket(String marketCode, int limit) {
        QChart60m c = QChart60m.chart60m;
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
    public List<Chart60m> findByMarketBefore(String marketCode, Long beforeTimestamp, int limit) {
        QChart60m c = QChart60m.chart60m;
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
