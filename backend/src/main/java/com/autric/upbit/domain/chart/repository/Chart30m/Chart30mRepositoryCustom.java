package com.autric.upbit.domain.chart.repository.Chart30m;

import com.autric.upbit.domain.chart.entity.Chart30m;

import java.util.List;

public interface Chart30mRepositoryCustom {

    List<Chart30m> findLatestByMarket(String marketCode, int limit);

    List<Chart30m> findByMarketBefore(String marketCode, Long beforeTimestamp, int limit);
}
