package com.autric.upbit.domain.chart.repository.Chart1d;

import com.autric.upbit.domain.chart.entity.Chart1d;

import java.util.List;

public interface Chart1dRepositoryCustom {

    List<Chart1d> findLatestByMarket(String marketCode, int limit);

    List<Chart1d> findByMarketBefore(String marketCode, Long beforeTimestamp, int limit);
}
