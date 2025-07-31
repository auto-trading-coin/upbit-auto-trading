package com.autric.upbit.domain.chart.repository.Chart30m;

import com.autric.upbit.domain.chart.entity.Chart30m;

import java.util.List;

public interface Chart30mRepositoryCustom {

    /**
     * 지정된 마켓의 최신 limit개
     * candleDateTimeKst DESC 순으로 조회
     */
    List<Chart30m> findLatestByMarket(String marketCode, int limit);
}
