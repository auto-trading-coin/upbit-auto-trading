package com.autric.upbit.domain.chart.repository.Chart240m;

import com.autric.upbit.domain.chart.entity.Chart240m;

import java.util.List;

public interface Chart240mRepositoryCustom {

    /**
     * 지정된 마켓의 최신 limit개
     * candleDateTimeKst DESC 순으로 조회
     */
    List<Chart240m> findLatestByMarket(String marketCode, int limit);
}
