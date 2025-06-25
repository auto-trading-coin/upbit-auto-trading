package com.autric.upbit.domain.chart.service;

import com.autric.upbit.domain.chart.entity.ChartSyncMeta;
import com.autric.upbit.domain.chart.entity.Market;
import com.autric.upbit.domain.chart.repository.ChartSyncMetaRepository;
import com.autric.upbit.domain.chart.sync.ChartFullSyncExecutor;
import com.autric.upbit.domain.chart.sync.ChartDeltaSyncExecutor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/**
 * 차트 동기화 서비스.
 *
 * <p>차트 메타 정보({@link ChartSyncMeta})를 기반으로 전체(Full) 또는 증분(Delta) 동기화를 실행합니다.
 * 동기화 실행은 각각 {@link ChartFullSyncExecutor}, {@link ChartDeltaSyncExecutor}에 위임됩니다.
 *
 * @see ChartSyncMetaRepository
 * @see ChartFullSyncExecutor
 * @see ChartDeltaSyncExecutor
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ChartSyncService {

    private final ChartSyncMetaRepository chartSyncMetaRepository;
    private final ChartFullSyncExecutor chartFullSyncExecutor;
    private final ChartDeltaSyncExecutor chartDeltaSyncExecutor;

    /**
     * ChartSyncMeta 조회 또는 생성
     */
    public ChartSyncMeta getOrInitSyncMeta(Market market, int unit) {
        return chartSyncMetaRepository.findByMarketAndUnit(market, unit)
                .orElseGet(() -> chartSyncMetaRepository.save(
                        ChartSyncMeta.builder()
                                .market(market)
                                .unit(unit)
                                .lastSyncedAt(null)
                                .isFullSynced(false)
                                .build()
                ));
    }

    /**
     * Full Sync 실행
     */
    public void fullSync(ChartSyncMeta syncMeta, Market market, int unit) {
        log.info("FullSync 실행 시작 → Market: {}, Unit: {}", market.getCoin(), unit);
        chartFullSyncExecutor.execute(syncMeta, market, unit);
    }

    /**
     * Delta Sync 실행
     */
    public void deltaSync(ChartSyncMeta syncMeta, Market market, int unit) {
        log.info("DeltaSync 실행 시작 → Market: {}, Unit: {}", market.getCoin(), unit);
        chartDeltaSyncExecutor.execute(syncMeta, market, unit);
    }
}
