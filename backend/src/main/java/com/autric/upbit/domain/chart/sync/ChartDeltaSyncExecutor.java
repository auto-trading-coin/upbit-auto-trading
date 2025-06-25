package com.autric.upbit.domain.chart.sync;

import com.autric.upbit.domain.chart.entity.ChartSyncMeta;
import com.autric.upbit.domain.chart.entity.Market;
import com.autric.upbit.domain.chart.repository.ChartSyncMetaRepository;
import com.autric.upbit.external.upbit.client.UpbitApiClient;
import com.autric.upbit.external.upbit.dto.response.UpbitCandleResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 차트 데이터의 델타(증분) 동기화를 수행하는 컴포넌트입니다.
 *
 * <p>마지막 동기화 시점 이후의 캔들 데이터를 Upbit API로부터 조회하여
 * DB에 저장하고, 동기화 메타 정보를 갱신합니다.
 *
 * <p>1분~1일 단위 캔들을 지원하며, 중복 데이터 무시 및 API 호출 제한을 고려한 로직을 포함합니다.
 *
 * @see ChartSyncMeta
 * @see ChartPersistHelper
 * @see UpbitApiClient
 */

@Slf4j
@Component
@RequiredArgsConstructor
public class ChartDeltaSyncExecutor {

    private final UpbitApiClient upbitApiClient;
    private final ChartPersistHelper persistHelper;
    private final ChartSyncMetaRepository chartSyncMetaRepository;

    @Transactional
    public void execute(ChartSyncMeta syncMeta, Market market, int unit) {

        final int count = 200;

        LocalDateTime lastSyncedAt = syncMeta.getLastSyncedAt();
        if (lastSyncedAt == null) {
            log.warn("DeltaSync 실패 - lastSyncedAt null: {}", market.getCoin());
            return;
        }

        LocalDateTime toTime = LocalDateTime.now(); // 현재 시각 부터 동기화 하도록 설정
        LocalDateTime maxSyncedAt = lastSyncedAt; // 최대 maxSyncedAt까지 동기화
        LocalDateTime deltaSyncedLatestTime = null; // 동기화된 캔들의 가장 최신 시각 기억

        log.info("[Delta Sync] 시작 → Market: {}, Unit: {}, lastSyncedAt: {}", market.getCoin(), unit, lastSyncedAt);

        while (true) {

            List<UpbitCandleResponse> responseList = (unit == 1440)
                    ? upbitApiClient.getDayCandles(market, count, toTime)
                    : upbitApiClient.getMinuteCandles(market, unit, count, toTime);

            if (responseList == null || responseList.isEmpty()) {
                log.info("응답 없음 또는 빈 응답 - 종료: Market={}, Unit={}, toTime={}", market.getCoin(), unit, toTime);
                break;
            }

            // 차트 데이터 DB저장
            persistHelper.persistByUnit(responseList, market, unit);

            // 가장 최근 데이터 기준 시각 기억
            if (deltaSyncedLatestTime == null) {
                deltaSyncedLatestTime = responseList.get(0).getParsedDateTime();
            }

            // 더욱 이전 데이터 불러 오도록 시각 뒤로
            toTime = responseList.get(responseList.size() - 1).getParsedDateTime().minusSeconds(1);

            if (responseList.size() < count) {
                log.info("마지막 페이지 도달 - 캔들 수 {} < count {} → 종료", responseList.size(), count);
                break;
            }

            if (maxSyncedAt.isAfter(toTime)) {
                log.info("toTime({}) > maxSyncedAt({}) → 더 이상 동기화할 데이터 없음", toTime, maxSyncedAt);
                break;
            }

            try {
                Thread.sleep(120);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                log.warn("Thread sleep 중단 - 동기화 중단됨");
                break;
            }
        }

        // 가장 최근 데이터 기준 시각 syncMeta 저장
        if (deltaSyncedLatestTime != null && deltaSyncedLatestTime.isAfter(syncMeta.getLastSyncedAt())) {
            syncMeta.updateLastSyncedAt(deltaSyncedLatestTime);
            chartSyncMetaRepository.save(syncMeta);
        }

        log.info("[Delta Sync] 완료 → Market: {}, Unit: {}, 최종 동기화 시점: {}",
                market.getCoin(), unit, deltaSyncedLatestTime);
    }
}
