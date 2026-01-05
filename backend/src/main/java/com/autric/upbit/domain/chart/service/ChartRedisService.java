package com.autric.upbit.domain.chart.service;

import com.autric.upbit.domain.chart.dto.response.ChartResponse;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChartRedisService {

    private final RedisTemplate<String, Object> redisTemplate;

    private static final int CHART_LIMIT = 400;

    /**
     * Redis 동기화 결과
     */
    @Getter
    public enum SyncResult {
        NEED_FULL_RESET("Redis가 비었거나 데이터가 stale 상태"),
        DELTA_PUSHED("신규 캔들 추가됨"),
        NO_UPDATE("변경 없음");

        private final String description;

        SyncResult(String description) {
            this.description = description;
        }
    }

    /**
     * Redis 동기화 (연속성 검증 + Delta Push)
     *
     * @param market      마켓 코드 (예: KRW-BTC)
     * @param unit        캔들 단위 (분)
     * @param newFromUpbit 업비트에서 받아온 최신 캔들 목록
     * @return SyncResult
     */
    public SyncResult syncRedis(String market, int unit, List<ChartResponse> newFromUpbit) {
        String key = buildKey(market, unit);

        // 1. Redis 최신 캔들 timestamp 확인
        Long latestTimestamp = getLatestTimestamp(key);

        // 2. 연속성 검증
        if (latestTimestamp == null) {
            log.info("Redis 비어있음 - 전체 리셋 필요: {}", key);
            return SyncResult.NEED_FULL_RESET;
        }

        if (isStale(latestTimestamp, unit)) {
            log.info("Redis 데이터 stale - 전체 리셋 필요: {}", key);
            return SyncResult.NEED_FULL_RESET;
        }

        // 3. 신규 캔들 필터링 (Redis 최신 이후 것만)
        // 오래된순 정렬 후 leftPush → index 0이 최신이 됨
        List<ChartResponse> toAdd = newFromUpbit.stream()
                .filter(c -> c.getTimestamp() > latestTimestamp)
                .sorted(Comparator.comparing(ChartResponse::getTimestamp))  // ASC (오래된순)
                .toList();

        if (toAdd.isEmpty()) {
            return SyncResult.NO_UPDATE;
        }

        // 4. Delta push
        for (ChartResponse candle : toAdd) {
            redisTemplate.opsForList().leftPush(key, candle);
        }
        redisTemplate.opsForList().trim(key, 0, CHART_LIMIT - 1);

        log.debug("Delta push 완료: {} - {}개 추가", key, toAdd.size());
        return SyncResult.DELTA_PUSHED;
    }

    /**
     * Redis 전체 리셋
     *
     * @param market   마켓 코드
     * @param unit     캔들 단위
     * @param fullData MySQL에서 조회한 전체 데이터
     */
    public void resetRedis(String market, int unit, List<ChartResponse> fullData) {
        String key = buildKey(market, unit);

        if (fullData == null || fullData.isEmpty()) {
            log.warn("리셋할 데이터가 없음: {}", key);
            return;
        }

        // 오래된순 정렬 후 leftPush → index 0이 최신이 됨
        List<ChartResponse> sorted = fullData.stream()
                .sorted(Comparator.comparing(ChartResponse::getTimestamp))  // ASC (오래된순)
                .toList();

        // delete 대신 덮어쓰기 방식 (Redis MISCONF 에러 방지)
        for (ChartResponse candle : sorted) {
            redisTemplate.opsForList().leftPush(key, candle);
        }
        redisTemplate.opsForList().trim(key, 0, CHART_LIMIT - 1);

        log.info("Redis 전체 리셋 완료: {} - {}개 저장", key, sorted.size());
    }

    /**
     * Redis에서 최신 캔들의 timestamp 조회
     * GenericJackson2JsonRedisSerializer가 LinkedHashMap으로 반환하므로 직접 추출
     */
    public Long getLatestTimestamp(String key) {
        Object first = redisTemplate.opsForList().index(key, 0);
        
        if (first == null) {
            return null;
        }
        
        if (first instanceof LinkedHashMap) {
            @SuppressWarnings("unchecked")
            LinkedHashMap<String, Object> map = (LinkedHashMap<String, Object>) first;
            Object timestamp = map.get("timestamp");
            if (timestamp instanceof Number) {
                return ((Number) timestamp).longValue();
            }
        }
        
        if (first instanceof ChartResponse) {
            return ((ChartResponse) first).getTimestamp();
        }
        
        log.warn("알 수 없는 타입: {}", first.getClass().getName());
        return null;
    }

    /**
     * 데이터 연속성 검증 (stale 여부)
     *
     * @param timestamp 최신 캔들의 timestamp
     * @param unit      캔들 단위 (분)
     * @return stale이면 true
     */
    private boolean isStale(long timestamp, int unit) {
        long now = System.currentTimeMillis();
        // 허용 gap: 캔들 2개 분량 + 1분 여유
        long allowedGapMs = (unit * 2L + 1) * 60 * 1000L;
        long actualGap = now - timestamp;

        if (actualGap > allowedGapMs) {
            log.debug("Stale 감지 - timestamp: {}, gap: {}분, 허용: {}분",
                    timestamp, actualGap / 60000, allowedGapMs / 60000);
            return true;
        }
        return false;
    }

    /**
     * Redis 키 생성
     */
    private String buildKey(String market, int unit) {
        return "chart:" + market + ":" + unit;
    }

    /**
     * @deprecated 기존 메서드 - syncRedis()와 resetRedis()로 대체됨
     */
    @Deprecated
    public void saveChartToRedis(String marketCode, int unit, List<ChartResponse> chartList) {
        resetRedis(marketCode, unit, chartList);
    }
}
