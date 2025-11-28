package com.autric.upbit.domain.order.dto.response;

import com.autric.upbit.domain.order.entity.Orders;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Builder
public class OrderResponse {
    private Long id; // 주문 ID
    private String market; // 마켓 코드 (예: BTC-KRW)
    private String side; // bid/ask
    private BigDecimal price; // 주문 가격
    private BigDecimal volume; // 주문 수량
    private BigDecimal totalAmount; // 총 금액 (price * volume)
    private LocalDateTime createdAt; // 생성 시간
    private Long relatedSignalId; // 관련 시그널 ID (nullable)

    public static OrderResponse fromEntity(Orders order) {
        BigDecimal totalAmount = order.getPrice() != null && order.getVolume() != null
                ? order.getPrice().multiply(order.getVolume())
                : BigDecimal.ZERO;

        return OrderResponse.builder()
                .id(order.getId())
                .market(order.getMarket().getCoin())
                .side(order.getSide().getValue())
                .price(order.getPrice())
                .volume(order.getVolume())
                .totalAmount(totalAmount)
                .createdAt(order.getCreatedAt())
                .relatedSignalId(order.getSignal() != null ? order.getSignal().getId() : null)
                .build();
    }
}
