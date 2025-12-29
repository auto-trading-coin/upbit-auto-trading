package com.autric.upbit.domain.chart.repository.Chart1d;

import com.autric.upbit.domain.chart.entity.Chart1d;
import com.autric.upbit.domain.chart.entity.QChart1d;
import com.autric.upbit.domain.chart.entity.QMarket;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;

import java.util.List;

@RequiredArgsConstructor
public class Chart1dRepositoryImpl implements Chart1dRepositoryCustom{

    private final JPAQueryFactory queryFactory;

    @Override
    public List<Chart1d> findLatestByMarket(String marketCode, int limit) {
        QChart1d c = QChart1d.chart1d;
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
    public List<Chart1d> findByMarketBefore(String marketCode, Long beforeTimestamp, int limit) {
        QChart1d c = QChart1d.chart1d;
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
