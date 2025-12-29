package com.autric.upbit.domain.chart.controller;

import com.autric.upbit.domain.chart.dto.response.ChartResponse;
import com.autric.upbit.domain.chart.service.ChartService;
import com.autric.upbit.global.response.code.SuccessCode;
import com.autric.upbit.global.response.structure.SuccessResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/chart")
@RequiredArgsConstructor
public class ChartController {

    private final ChartService chartService;

    /**
     * 차트 데이터 조회
     * GET /chart/{market}?unit=5&limit=200&before=1766777000000
     *
     * @param market 마켓 코드 (예: KRW-BTC)
     * @param unit   타임프레임 (1, 5, 30, 60, 240, 1440)
     * @param limit  조회 개수 (기본값: 200)
     * @param before 이 timestamp 이전 데이터 조회 (무한 스크롤용, optional)
     */
    @GetMapping("/{market}")
    public ResponseEntity<?> getChartData(
            @PathVariable String market,
            @RequestParam(defaultValue = "5") int unit,
            @RequestParam(defaultValue = "200") int limit,
            @RequestParam(required = false) Long before) {
        
        List<ChartResponse> response;
        if (before != null) {
            response = chartService.fetchBefore(market, unit, before, limit);
        } else {
            response = chartService.fetchLatest(market, unit, limit);
        }
        
        return SuccessResponse.createSuccess(SuccessCode.CHART_DATA_SUCCESS, response);
    }
}
