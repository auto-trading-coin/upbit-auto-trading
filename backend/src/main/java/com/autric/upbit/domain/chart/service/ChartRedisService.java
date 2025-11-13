package com.autric.upbit.domain.chart.service;

import com.autric.upbit.domain.chart.dto.response.ChartResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ChartRedisService {

    private final RedisTemplate<String, Object> redisTemplate;

    private static final int CHART_LIMIT = 400;

    public void saveChartToRedis(String marketCode, int unit, List<ChartResponse> chartList) {
        String redisKey = "chart:" + marketCode + ":" + unit;

        // 최신 데이터부터 넣기 위해 역순 정렬
        List<ChartResponse> reversed = new ArrayList<>(chartList);
        Collections.reverse(reversed);

        for (ChartResponse chart : reversed) {
            redisTemplate.opsForList().leftPush(redisKey, chart); // 객체 그대로 저장
        }

        // Redis 리스트 길이를 200개로 제한
        redisTemplate.opsForList().trim(redisKey, 0, CHART_LIMIT - 1);
    }
}
