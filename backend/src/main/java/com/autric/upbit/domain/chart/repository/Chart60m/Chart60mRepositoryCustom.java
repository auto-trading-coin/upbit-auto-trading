package com.autric.upbit.domain.chart.repository.Chart60m;

import com.autric.upbit.domain.chart.entity.Chart60m;

import java.util.List;

public interface Chart60mRepositoryCustom {

    List<Chart60m> findLatestByMarket(String marketCode, int limit);

    List<Chart60m> findByMarketBefore(String marketCode, Long beforeTimestamp, int limit);
}
