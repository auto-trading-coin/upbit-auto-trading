package com.autric.upbit.domain.chart.repository.Chart1d;

import com.autric.upbit.domain.chart.entity.Chart1d;

import java.util.List;

public interface Chart1dRepositoryCustom {

    /**
     * 지정된 마켓의 최신 limit개 1d 차트를
     * candleDateTimeKst DESC 순으로 조회
     */
    List<Chart1d> findLatestByMarket(String marketCode, int limit);
}
