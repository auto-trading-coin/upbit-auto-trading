package com.autric.upbit.domain.account.controller;

import com.autric.upbit.domain.account.dto.response.*;
import com.autric.upbit.domain.account.service.AccountService;
import com.autric.upbit.global.response.code.SuccessCode;
import com.autric.upbit.global.response.structure.SuccessResponse;
import com.autric.upbit.global.security.oauth2.CustomOAuth2User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 투자손익 관련 API 컨트롤러
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/portfolio/profit")
public class AccountController {

    private final AccountService accountService;

    /**
     * 일별 투자손익 조회
     * GET /portfolio/profit/daily?year=2025&month=12
     */
    @GetMapping("/daily")
    public ResponseEntity<?> getDailyProfit(
            @AuthenticationPrincipal CustomOAuth2User user,
            @RequestParam int year,
            @RequestParam int month) {
        
        DailyProfitResponse response = accountService.getDailyProfit(user.getMember(), year, month);
        return SuccessResponse.createSuccess(SuccessCode.GET_PROFIT_SUCCESS, response);
    }

    /**
     * 월별 투자손익 조회
     * GET /portfolio/profit/monthly?year=2025
     */
    @GetMapping("/monthly")
    public ResponseEntity<?> getMonthlyProfit(
            @AuthenticationPrincipal CustomOAuth2User user,
            @RequestParam int year) {
        
        MonthlyProfitResponse response = accountService.getMonthlyProfit(user.getMember(), year);
        return SuccessResponse.createSuccess(SuccessCode.GET_PROFIT_SUCCESS, response);
    }

    /**
     * 연도별 투자손익 조회
     * GET /portfolio/profit/yearly
     */
    @GetMapping("/yearly")
    public ResponseEntity<?> getYearlyProfit(
            @AuthenticationPrincipal CustomOAuth2User user) {
        
        YearlyProfitResponse response = accountService.getYearlyProfit(user.getMember());
        return SuccessResponse.createSuccess(SuccessCode.GET_PROFIT_SUCCESS, response);
    }

    /**
     * 전체 기간 트레이딩 지표 조회
     * GET /portfolio/profit/metrics
     */
    @GetMapping("/metrics")
    public ResponseEntity<?> getTradingMetrics(
            @AuthenticationPrincipal CustomOAuth2User user) {
        
        TradingMetricsResponse response = accountService.getTradingMetrics(user.getMember());
        return SuccessResponse.createSuccess(SuccessCode.GET_PROFIT_SUCCESS, response);
    }

    /**
     * 사용 가능한 연도 목록 조회
     * GET /portfolio/profit/years
     */
    @GetMapping("/years")
    public ResponseEntity<?> getAvailableYears(
            @AuthenticationPrincipal CustomOAuth2User user) {
        
        List<Integer> years = accountService.getAvailableYears(user.getMember());
        return SuccessResponse.createSuccess(SuccessCode.GET_PROFIT_SUCCESS, years);
    }
}
