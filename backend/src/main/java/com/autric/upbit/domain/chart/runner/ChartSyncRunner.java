package com.autric.upbit.domain.chart.runner;

import com.autric.upbit.domain.chart.entity.ChartSyncMeta;
import com.autric.upbit.domain.chart.entity.Market;
import com.autric.upbit.domain.chart.repository.MarketRepository;
import com.autric.upbit.domain.chart.service.ChartSyncService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * ChartSyncRunner
 * - 서버 시작 시 자동으로 차트 Full Sync 시작
 * - ApplicationReadyEvent 사용
 * - 분봉(1,5,30,60,240), 일봉(1440) 분리 처리
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class ChartSyncRunner {

    private final ChartSyncService chartSyncService;
    private final MarketRepository marketRepository;

    /**
     * 서버 시작 시 ApplicationReadyEvent 발생 시점에 호출됨
     * - Market 목록 조회 → 각 Market 에 대해 ChartSyncService / ChartDaysSyncService 호출
     *
     * @param event ApplicationReadyEvent
     */
    @EventListener(ApplicationReadyEvent.class)
    public void run(ApplicationReadyEvent event) {

        log.info("ChartSyncRunner 시작 → 서버 기동 후 차트 동기화 시작");

        // Market 목록 조회
        List<Market> marketList = marketRepository.findAll();

        // === (1,5,30,60,240,1440) 처리 ===
        List<Integer> units = List.of(1, 5, 30, 60, 240, 1440);

        for(Market market : marketList) {
            for (Integer unit : units) {
                try {
                    ChartSyncMeta syncMeta = chartSyncService.getOrInitSyncMeta(market, unit);

                    if (!syncMeta.isFullSynced()) {
                        chartSyncService.fullSync(syncMeta, market, unit);
                    } else {
                        chartSyncService.deltaSync(syncMeta, market, unit);
                    }

                } catch (Exception e) {
                    log.error("ChartSync 실패 → Market: {}, Unit: {}, Error: {}", market.getCoin(), unit, e.getMessage(), e);
                }

                try {
                    Thread.sleep(120);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    log.warn("Thread sleep 중단 - 동기화 중단됨");
                    break;
                }
            }
        }

        log.info("ChartSyncRunner 종료 → 서버 기동 후 초기 차트 동기화 완료");
    }
}
