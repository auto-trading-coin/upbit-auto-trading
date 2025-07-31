package com.autric.upbit.domain.chart.repository.Chart5m;

import com.autric.upbit.domain.chart.entity.Chart5m;

import java.util.List;

public interface Chart5mRepositoryCustom {

    /**
     * 지정된 마켓의 최신 limit개
     * candleDateTimeKst DESC 순으로 조회
     */
    List<Chart5m> findLatestByMarket(String marketCode, int limit);
}
