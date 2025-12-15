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
    public int execute(ChartSyncMeta syncMeta, Market market, int unit) {
        final int count = 200;

        LocalDateTime lastSyncedAt = syncMeta.getLastSyncedAt();
        if (lastSyncedAt == null) {
            return 0;
        }

        LocalDateTime toTime = LocalDateTime.now(); // 현재 시각 부터 동기화 하도록 설정
        LocalDateTime maxSyncedAt = lastSyncedAt; // 최대 maxSyncedAt까지 동기화
        LocalDateTime deltaSyncedLatestTime = null; // 동기화된 캔들의 가장 최신 시각 기억
        int totalSyncedCount = 0;

        while (true) {
            List<UpbitCandleResponse> responseList = (unit == 1440)
                    ? upbitApiClient.getDayCandles(market, count, toTime)
                    : upbitApiClient.getMinuteCandles(market, unit, count, toTime);

            if (responseList == null || responseList.isEmpty()) {
                log.info("응답 없음 또는 빈 응답 - 종료: Market={}, Unit={}, toTime={}", market.getCoin(), unit, toTime);
                break;
            }

            // 중복 제거 (lastSyncedAt 이후 캔들만) + 완성된 캔들만 필터링
            LocalDateTime now = LocalDateTime.now();
            int candleMinutes = (unit == 1440) ? 1440 : unit;

            // 필터조건 :
            // 1. 가장최신 싱크된 캔들 이후의 캔들만 저장
            // 2. 미완성된 가장 최신캔들 1개 제외
            List<UpbitCandleResponse> filtered = responseList.stream()
                    .filter(candle -> candle.getParsedDateTime().isAfter(maxSyncedAt))
                    .filter(candle -> candle.getParsedDateTime().plusMinutes(candleMinutes).isBefore(now))
                    .toList();

            // 차트 데이터 DB저장
            totalSyncedCount += persistHelper.persistByUnit(filtered, market, unit);

            // 가장 최근 데이터 기준 시각 기억 (완성된 캔들 중에서)
            if (deltaSyncedLatestTime == null && !filtered.isEmpty()) {
                deltaSyncedLatestTime = filtered.get(0).getParsedDateTime();
            }

            // 더욱 이전 데이터 불러 오도록 시각 뒤로
            toTime = responseList.get(responseList.size() - 1).getParsedDateTime().minusSeconds(1);

            if (responseList.size() < count) {
                break;
            }

            if (maxSyncedAt.isAfter(toTime)) {
                break;
            }

            try {
                Thread.sleep(120);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                break;
            }
        }

        // 가장 최근 데이터 기준 시각 syncMeta 저장
        if (deltaSyncedLatestTime != null && deltaSyncedLatestTime.isAfter(syncMeta.getLastSyncedAt())) {
            syncMeta.updateLastSyncedAt(deltaSyncedLatestTime);
            chartSyncMetaRepository.save(syncMeta);
        }

        return totalSyncedCount;
    }
}
