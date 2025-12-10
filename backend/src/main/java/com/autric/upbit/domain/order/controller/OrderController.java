package com.autric.upbit.domain.order.controller;

import com.autric.upbit.domain.order.dto.response.OrderListResponse;
import com.autric.upbit.domain.order.service.OrderService;
import com.autric.upbit.domain.signal.dto.response.SignalResponse;
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
@RequiredArgsConstructor
@RequestMapping("/order")
public class OrderController {

    private final OrderService orderService;

    /**
     * 현재 로그인한 사용자의 주문 목록 조회
     * GET
     * /order?page=0&size=10&market=KRW-BTC&startDate=2025-12-01&endDate=2025-12-08&side=bid
     */
    @GetMapping
    public ResponseEntity<?> getMyOrders(
            @AuthenticationPrincipal CustomOAuth2User user,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String market,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) String side) {
        OrderListResponse response = orderService.getOrdersByMemberWithFilters(
                user.getMember().getId(), page, size, market, startDate, endDate, side);
        return SuccessResponse.createSuccess(SuccessCode.ORDER_LIST_SUCCESS, response);
    }

    /**
     * 특정 주문의 관련 시그널 조회
     * GET /order/{orderId}/signal
     */
    @GetMapping("/{orderId}/signal")
    public ResponseEntity<?> getRelatedSignal(@PathVariable Long orderId) {
        SignalResponse signal = orderService.getRelatedSignal(orderId);
        return SuccessResponse.createSuccess(SuccessCode.SIGNAL_DETAIL_SUCCESS, signal);
    }
}
