package com.autric.upbit.domain.chart.repository.Chart60m;

import com.autric.upbit.domain.chart.entity.Chart60m;

import java.util.List;

public interface Chart60mRepositoryCustom {

    /**
     * 지정된 마켓의 최신 limit개
     * candleDateTimeKst DESC 순으로 조회
     */
    List<Chart60m> findLatestByMarket(String marketCode, int limit);
}
