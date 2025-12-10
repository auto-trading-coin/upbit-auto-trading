package com.autric.upbit.domain.signal.controller;

import com.autric.upbit.domain.signal.dto.response.SignalListResponse;
import com.autric.upbit.domain.signal.service.SignalService;
import com.autric.upbit.global.response.code.SuccessCode;
import com.autric.upbit.global.response.structure.SuccessResponse;
import com.autric.upbit.global.security.oauth2.CustomOAuth2User;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/signal")
@RequiredArgsConstructor
public class SignalController {

    private final SignalService signalService;

    /**
     * 시그널 로그 조회
     * GET
     * /signal?page=0&size=10&market=KRW-BTC&startDate=2025-12-01&endDate=2025-12-08&strategyId=1
     */
    @GetMapping
    public ResponseEntity<?> getSignalLogs(
            @AuthenticationPrincipal CustomOAuth2User user,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String market,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) Long strategyId) {
        SignalListResponse response = signalService.getSignalsByMemberWithFilters(
                user.getMember().getId(), page, size, market, startDate, endDate, strategyId);
        return SuccessResponse.createSuccess(SuccessCode.SIGNAL_LIST_SUCCESS, response);
    }
}
