package com.autric.upbit.domain.chart.scheduler;

import com.autric.upbit.domain.chart.dto.response.ChartResponse;
import com.autric.upbit.domain.chart.entity.ChartSyncMeta;
import com.autric.upbit.domain.chart.entity.Market;
import com.autric.upbit.domain.chart.repository.MarketRepository;
import com.autric.upbit.domain.chart.service.ChartRedisService;
import com.autric.upbit.domain.chart.service.ChartRedisService.SyncResult;
import com.autric.upbit.domain.chart.service.ChartService;
import com.autric.upbit.domain.chart.service.ChartSyncService;
import com.autric.upbit.domain.chart.sync.ChartDeltaSyncExecutor.DeltaSyncResult;
import com.autric.upbit.external.kafka.dto.PriceUpdateEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicBoolean;

/**
 * ChartSyncScheduler
 * - 업비트 차트 데이터를 주기적으로 동기화하는 스케줄러 클래스
 * - 서버 기동 시 1회 실행, 이후 매분 00초마다 반복 실행
 * - AtomicBoolean을 사용하여 동시 실행 방지
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class ChartSyncScheduler {

    private final ChartSyncService chartSyncService;
    private final ChartService chartService;
    private final MarketRepository marketRepository;
    private final ChartRedisService chartRedisService;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    // 지원하는 캔들 단위 목록 (단위: 분) -> 일봉은 1440
    private static final List<Integer> UNITS = List.of(1, 5, 30, 60, 240, 1440);
    private static final int CHART_LIMIT = 400;

    // 동시 실행 방지용 플래그
    private final AtomicBoolean isRunning = new AtomicBoolean(false);

    /**
     * 서버 시작 시 1회 실행
     */
    @EventListener(ApplicationReadyEvent.class)
    public void onStartup() {
        log.info("서버 시작 - 초기 차트 동기화 실행");
        syncAllMarkets();
    }

    /**
     * 매분 00초마다 실행
     */
    @Scheduled(cron = "0 * * * * *")
    public void scheduledSync() {
        syncAllMarkets();
    }

    /**
     * 업비트 캔들 동기화 작업을 전체 마켓 + 단위별로 수행하는 메서드
     */
    public void syncAllMarkets() {
        // 동시 실행 방지: 이미 실행 중이면 스킵
        if (!isRunning.compareAndSet(false, true)) {
            log.warn("이전 동기화 작업이 아직 진행 중 - 스킵");
            return;
        }

        try {
            log.info("ChartSyncScheduler 시작");

            List<Market> marketList = marketRepository.findAll();
            int totalSaveCount = 0;

            for (Market market : marketList) {
                int marketSaveCount = 0;

                for (Integer unit : UNITS) {
                    try {
                        int savedCount = syncMarketUnit(market, unit);
                        marketSaveCount += savedCount;

                        // 업비트 API 요청 간 120ms 딜레이 삽입 (Rate Limit 대응)
                        Thread.sleep(120);

                    } catch (Exception e) {
                        log.error("ChartSync 실패 - Market: {}, Unit: {}, Error: {}",
                                market.getCoin(), unit, e.getMessage(), e);
                    }
                }

                // 마켓별 신규 데이터가 있으면 Kafka 메시지 전송
                if (marketSaveCount > 0) {
                    sendKafkaEvent(market);
                }

                totalSaveCount += marketSaveCount;
            }

            log.info("ChartSyncScheduler 종료 - {}건 저장", totalSaveCount);

        } finally {
            isRunning.set(false);
        }
    }

    /**
     * 마켓 + 단위별 동기화 수행
     *
     * @return 저장된 캔들 수
     */
    private int syncMarketUnit(Market market, int unit) {
        ChartSyncMeta syncMeta = chartSyncService.getOrInitSyncMeta(market, unit);

        // 1) FullSync 진행 중 -> MySQL만 동기화, Redis 스킵
        if (!syncMeta.isFullSynced()) {
            int savedCount = chartSyncService.fullSync(syncMeta, market, unit);
            log.debug("FullSync 진행 중 - Redis 동기화 스킵: {}-{}", market.getCoin(), unit);
            return savedCount;
        }

        // 2) DeltaSync 실행 -> 저장된 캔들 리스트 반환
        DeltaSyncResult result = chartSyncService.deltaSync(syncMeta, market, unit);

        // 3) Redis 동기화 (저장된 캔들 리스트 직접 전달)
        syncRedis(market.getCoin(), unit, result.savedCandles());

        return result.savedCount();
    }

    /**
     * Redis 동기화 (연속성 검증 + Delta Push)
     */
    private void syncRedis(String marketCode, int unit, List<ChartResponse> newCandles) {
        // Redis 동기화 시도 (MySQL 재조회 없이 바로 전달)
        SyncResult result = chartRedisService.syncRedis(marketCode, unit, newCandles);

        // 전체 리셋이 필요한 경우에만 MySQL 조회
        if (result == SyncResult.NEED_FULL_RESET) {
            List<ChartResponse> fullData = chartService.fetchLatest(marketCode, unit, CHART_LIMIT);
            chartRedisService.resetRedis(marketCode, unit, fullData);
        }
    }

    /**
     * Kafka 이벤트 전송
     */
    private void sendKafkaEvent(Market market) {
        PriceUpdateEvent event = PriceUpdateEvent.builder()
                .eventId(UUID.randomUUID().toString())
                .market(market.getCoin())
                .ts(Instant.now())
                .build();
        kafkaTemplate.send("price.update", market.getCoin(), event);
    }
}
