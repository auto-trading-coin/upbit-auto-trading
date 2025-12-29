package com.autric.upbit.domain.chart.repository.Chart240m;

import com.autric.upbit.domain.chart.entity.Chart240m;

import java.util.List;

public interface Chart240mRepositoryCustom {

    List<Chart240m> findLatestByMarket(String marketCode, int limit);

    List<Chart240m> findByMarketBefore(String marketCode, Long beforeTimestamp, int limit);
}
