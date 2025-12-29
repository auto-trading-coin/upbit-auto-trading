package com.autric.upbit.domain.chart.service;


import com.autric.upbit.domain.chart.dto.response.ChartResponse;
import com.autric.upbit.domain.chart.repository.Chart1d.Chart1dRepository;
import com.autric.upbit.domain.chart.repository.Chart1m.Chart1mRepository;
import com.autric.upbit.domain.chart.repository.Chart240m.Chart240mRepository;
import com.autric.upbit.domain.chart.repository.Chart30m.Chart30mRepository;
import com.autric.upbit.domain.chart.repository.Chart5m.Chart5mRepository;
import com.autric.upbit.domain.chart.repository.Chart60m.Chart60mRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChartService {

    private final Chart1mRepository chart1mRepository;
    private final Chart5mRepository chart5mRepository;
    private final Chart30mRepository chart30mRepository;
    private final Chart60mRepository chart60mRepository;
    private final Chart240mRepository chart240mRepository;
    private final Chart1dRepository chart1dRepository;

    /**
     * marketCode + unit + limit 에 따라
     * 각 Repository 의 findLatestByMarket() 을 호출합니다.
     */
    public List<ChartResponse> fetchLatest(String marketCode, int unit, int limit) {
        return switch (unit) {
            case 1 -> chart1mRepository.findLatestByMarket(marketCode, limit)
                    .stream().map(e -> ChartResponse.fromEntity(e, 1)).toList();
            case 5 -> chart5mRepository.findLatestByMarket(marketCode, limit)
                    .stream().map(e -> ChartResponse.fromEntity(e, 5)).toList();
            case 30 -> chart30mRepository.findLatestByMarket(marketCode, limit)
                    .stream().map(e -> ChartResponse.fromEntity(e, 30)).toList();
            case 60 -> chart60mRepository.findLatestByMarket(marketCode, limit)
                    .stream().map(e -> ChartResponse.fromEntity(e, 60)).toList();
            case 240 -> chart240mRepository.findLatestByMarket(marketCode, limit)
                    .stream().map(e -> ChartResponse.fromEntity(e, 240)).toList();
            case 1440 -> chart1dRepository.findLatestByMarket(marketCode, limit)
                    .stream().map(e -> ChartResponse.fromEntity(e, 1440)).toList();
            default -> throw new IllegalArgumentException("지원하지 않는 unit: " + unit);
        };
    }

    /**
     * 특정 timestamp 이전의 차트 데이터 조회 (무한 스크롤용)
     */
    public List<ChartResponse> fetchBefore(String marketCode, int unit, Long beforeTimestamp, int limit) {
        return switch (unit) {
            case 1 -> chart1mRepository.findByMarketBefore(marketCode, beforeTimestamp, limit)
                    .stream().map(e -> ChartResponse.fromEntity(e, 1)).toList();
            case 5 -> chart5mRepository.findByMarketBefore(marketCode, beforeTimestamp, limit)
                    .stream().map(e -> ChartResponse.fromEntity(e, 5)).toList();
            case 30 -> chart30mRepository.findByMarketBefore(marketCode, beforeTimestamp, limit)
                    .stream().map(e -> ChartResponse.fromEntity(e, 30)).toList();
            case 60 -> chart60mRepository.findByMarketBefore(marketCode, beforeTimestamp, limit)
                    .stream().map(e -> ChartResponse.fromEntity(e, 60)).toList();
            case 240 -> chart240mRepository.findByMarketBefore(marketCode, beforeTimestamp, limit)
                    .stream().map(e -> ChartResponse.fromEntity(e, 240)).toList();
            case 1440 -> chart1dRepository.findByMarketBefore(marketCode, beforeTimestamp, limit)
                    .stream().map(e -> ChartResponse.fromEntity(e, 1440)).toList();
            default -> throw new IllegalArgumentException("지원하지 않는 unit: " + unit);
        };
    }
}
