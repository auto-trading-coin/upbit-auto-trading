package com.autric.upbit.domain.signal.dto.response;

import com.autric.upbit.domain.signal.entity.Signals;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Builder
public class SignalResponse {
    private Long id; // 시그널 ID
    private String strategy; // 전략명
    private String market; // 마켓 코드
    private String side; // bid/ask
    private LocalDateTime createdAt; // 생성 시간

    private String conditions; // 전략 조건

    @Setter
    private Long relatedOrderId; // 관련 주문 ID (nullable)

    public static SignalResponse fromEntity(Signals signal) {
        return SignalResponse.builder()
                .id(signal.getId())
                .strategy(signal.getStrategy().getName())
                .market(signal.getMarket().getCoin())
                .side(signal.getSide().getValue())
                .createdAt(signal.getCreatedAt())
                .conditions(signal.getStrategy().getConditions())
                // relatedOrderId는 별도 조회 필요 (Order -> Signal 관계이므로)
                .build();
    }
}
