package com.autric.upbit.domain.chart.repository.Chart240m;

import com.autric.upbit.domain.chart.entity.Chart240m;
import com.autric.upbit.domain.chart.entity.QChart240m;
import com.autric.upbit.domain.chart.entity.QMarket;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;

import java.util.List;

@RequiredArgsConstructor
public class Chart240mRepositoryImpl implements Chart240mRepositoryCustom{

    private final JPAQueryFactory queryFactory;

    @Override
    public List<Chart240m> findLatestByMarket(String marketCode, int limit) {
        QChart240m c = QChart240m.chart240m;
        QMarket m = QMarket.market;

        return queryFactory
                .selectFrom(c)
                .join(c.market, m).fetchJoin()
                .where(c.market.coin.eq(marketCode))
                .orderBy(c.candleDateTimeKst.desc())
                .limit(limit)
                .fetch();
    }
}
