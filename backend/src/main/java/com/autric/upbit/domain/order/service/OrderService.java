package com.autric.upbit.domain.order.service;

import com.autric.upbit.domain.order.dto.response.OrderListResponse;
import com.autric.upbit.domain.order.entity.Orders;
import com.autric.upbit.domain.order.entity.Side;
import com.autric.upbit.domain.order.repository.OrderRepository;
import com.autric.upbit.domain.signal.dto.response.SignalResponse;
import com.autric.upbit.global.response.code.ErrorCode;
import com.autric.upbit.global.response.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;

    @Transactional
    public Orders createOrder(Orders order) {
        return orderRepository.save(order);
    }

    /**
     * 회원의 주문 목록 조회 (페이징)
     */
    @Transactional(readOnly = true)
    public OrderListResponse getOrdersByMember(Long memberId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Orders> orderPage = orderRepository.findByMemberIdWithDetails(memberId, pageable);

        return OrderListResponse.fromEntity(orderPage);
    }

    /**
     * 회원의 주문 목록 조회 with 필터링 (마켓, 날짜 범위, 매수/매도)
     */
    @Transactional(readOnly = true)
    public OrderListResponse getOrdersByMemberWithFilters(
            Long memberId, int page, int size,
            String market, LocalDate startDate, LocalDate endDate, String side) {

        // LocalDate를 LocalDateTime으로 변환
        LocalDateTime startDateTime = startDate != null ? startDate.atStartOfDay() : null;
        LocalDateTime endDateTime = endDate != null ? endDate.plusDays(1).atStartOfDay() : null;

        // Side string을 enum으로 변환
        Side sideEnum = null;
        if (side != null && !side.isEmpty()) {
            try {
                sideEnum = Side.valueOf(side.toUpperCase());
            } catch (IllegalArgumentException e) {
                log.warn("Invalid side parameter: {}", side);
            }
        }

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Orders> orderPage = orderRepository.findByMemberIdWithFilters(
                memberId, market, startDateTime, endDateTime, sideEnum, pageable);

        return OrderListResponse.fromEntity(orderPage);
    }

    /**
     * 특정 주문의 관련 시그널 조회
     */
    @Transactional(readOnly = true)
    public SignalResponse getRelatedSignal(Long orderId) {
        Orders order = orderRepository.findById(orderId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ORDER_NOT_FOUND));

        return SignalResponse.fromEntity(order.getSignal());
    }
}
