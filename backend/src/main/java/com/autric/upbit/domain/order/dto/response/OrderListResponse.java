package com.autric.upbit.domain.order.dto.response;

import lombok.Builder;
import lombok.Getter;

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
}
