package com.autric.upbit.domain.order.service;

import com.autric.upbit.domain.order.dto.response.OrderListResponse;
import com.autric.upbit.domain.order.dto.response.OrderResponse;
import com.autric.upbit.domain.order.entity.Orders;
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

        List<OrderResponse> orderResponses = orderPage.getContent().stream()
                .map(OrderResponse::fromEntity)
                .toList();

        return OrderListResponse.builder()
                .orders(orderResponses)
                .totalPages(orderPage.getTotalPages())
                .totalElements(orderPage.getTotalElements())
                .currentPage(page)
                .pageSize(size)
                .hasMore(orderPage.hasNext())
                .build();
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
