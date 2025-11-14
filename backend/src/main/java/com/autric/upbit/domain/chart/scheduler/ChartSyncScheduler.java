package com.autric.upbit.domain.chart.scheduler;

import com.autric.upbit.domain.chart.dto.response.ChartResponse;
import com.autric.upbit.domain.chart.entity.ChartSyncMeta;
import com.autric.upbit.domain.chart.entity.Market;
import com.autric.upbit.domain.chart.repository.MarketRepository;
import com.autric.upbit.domain.chart.service.ChartRedisService;
import com.autric.upbit.domain.chart.service.ChartService;
import com.autric.upbit.domain.chart.service.ChartSyncService;
import com.autric.upbit.external.kafka.dto.PriceUpdateEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * ChartSyncScheduler
 * - 업비트 차트 데이터를 주기적으로 동기화하는 스케줄러 클래스
 * - 서버가 기동되면 즉시 1회 실행되며, 이후 1분 간격으로 반복 실행됨
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

    // 지원하는 캔들 단위 목록 (단위: 분) → 일봉은 1440
    private static final List<Integer> UNITS = List.of(1, 5, 30, 60, 240, 1440);

    /**
     * 업비트 캔들 동기화 작업을 전체 마켓 + 단위별로 수행하는 메서드
     * - Spring Scheduler에 의해 자동으로 실행됨
     * - 최초 실행: 서버 기동 직후 (initialDelay = 0)
     * - 이후 실행: 이전 작업 종료 후 60초 대기 (fixedDelay = 60000)
     */
    @Scheduled(initialDelay = 0, fixedDelay = 60000)
    public void syncAllMarkets() {
        log.info("ChartSyncScheduler 시작 → 전체 차트 동기화 수행");

        // 업비트 지원 마켓 전체 조회 (예: KRW-BTC, KRW-ETH 등)
        List<Market> marketList = marketRepository.findAll();
        int saveCount =0;

        for (Market market : marketList) {
            int cnt = 0;
            for (Integer unit : UNITS) {
                try {
                    // 1) DB 동기화
                    // 해당 마켓 + 단위 조합에 대한 Sync 메타데이터 조회 또는 초기화
                    ChartSyncMeta syncMeta = chartSyncService.getOrInitSyncMeta(market, unit);
                    // 아직 FullSync가 안 된 경우 → 필요 수량 만큼 전체 캔들 동기화
                    if (!syncMeta.isFullSynced()) {
                        cnt += chartSyncService.fullSync(syncMeta, market, unit);
                    }
                    // 이미 FullSync가 완료된 경우 → 최신 데이터만 DeltaSync로 갱신
                    else {
                        cnt += chartSyncService.deltaSync(syncMeta, market, unit);
                    }

                    // 2) MySQL에서 최신 200개 조회 → ChartService.fetchLatest 사용
                    List<ChartResponse> ChartList = chartService.fetchLatest(market.getCoin(), unit, 400);

                    // 3) Redis 저장
                    chartRedisService.saveChartToRedis(market.getCoin(), unit, ChartList);

                    // 업비트 API 요청 간 120ms 딜레이 삽입 (Rate Limit 대응)
                    Thread.sleep(120);

                } catch (Exception e) {
                    // 마켓 + 단위별 처리 중 에러 발생 시 로그 출력 (동기화는 계속 진행됨)
                    log.error("ChartSync 실패 → Market: {}, Unit: {}, Error: {}",
                            market.getCoin(), unit, e.getMessage(), e);
                }
            }
            if(cnt > 0){
                /*
                  마켓 별 카프카 메세지 전송
                  */
                PriceUpdateEvent event = PriceUpdateEvent.builder()
                        .eventId(UUID.randomUUID().toString())
                        .market(market.getCoin())
                        .ts(Instant.now())
                        .build();
                kafkaTemplate.send("price.update", market.getCoin(), event);
            }
            saveCount += cnt;
        }
        log.info("ChartSyncScheduler 종료 → 전체 동기화 완료 {} 건 저장 완료", saveCount);
    }
}