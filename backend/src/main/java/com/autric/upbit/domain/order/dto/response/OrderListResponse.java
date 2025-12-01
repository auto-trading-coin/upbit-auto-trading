package com.autric.upbit.domain.order.dto.response;

import com.autric.upbit.domain.order.entity.Orders;
import lombok.Builder;
import lombok.Getter;
import org.springframework.data.domain.Page;
import java.util.List;

@Getter
@Builder
public class OrderListResponse {
    private List<OrderResponse> orders;
    private int totalPages;
    private long totalElements;
    private int currentPage;
    private int pageSize;
    private boolean hasMore; // 무한 스크롤용

    public static OrderListResponse fromEntity(Page<Orders> orderPage) {
        List<OrderResponse> orderResponses = orderPage.getContent().stream()
                .map(OrderResponse::fromEntity)
                .toList();

        return OrderListResponse.builder()
                .orders(orderResponses)
                .totalPages(orderPage.getTotalPages())
                .totalElements(orderPage.getTotalElements())
                .currentPage(orderPage.getNumber())
                .pageSize(orderPage.getSize())
                .hasMore(orderPage.hasNext())
                .build();
    }
}
