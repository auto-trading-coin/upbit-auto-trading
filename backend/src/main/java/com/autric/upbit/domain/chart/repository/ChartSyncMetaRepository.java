package com.autric.upbit.domain.chart.repository;

import com.autric.upbit.domain.chart.entity.ChartSyncMeta;
import com.autric.upbit.domain.chart.entity.Market;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ChartSyncMetaRepository extends JpaRepository<ChartSyncMeta, Long> {

    /**
     * 마켓과 단위(unit) 기준으로 ChartSyncMeta 조회
     *
     * @param market 마켓
     * @param unit 단위
     * @return ChartSyncMeta (없으면 Optional.empty())
     */
    Optional<ChartSyncMeta> findByMarketAndUnit(Market market, Integer unit);
}
