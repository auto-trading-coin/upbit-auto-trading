package com.autric.upbit.domain.strategy.dto.response;

import com.autric.upbit.domain.strategy.entity.Strategy;
import com.autric.upbit.domain.strategy.entity.StrategyIndicator;
import lombok.Builder;
import lombok.Getter;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Getter
@Builder
public class StrategyDetailResponse {
    private Long id;
    private String name;
    private String information;
    private String conditions;
    private String strategyType;
    private List<IndicatorResponse> indicators;

    public static StrategyDetailResponse fromEntity(Strategy strategy) {
        List<IndicatorResponse> indicatorResponses = strategy.getIndicators().stream()
                .map(StrategyIndicator::getIndicator)  // Indicator 엔티티
                .map(IndicatorResponse::fromEntity)  // DTO 변환
                .sorted(Comparator.comparing(IndicatorResponse::getName).reversed())
                .collect(Collectors.toList());

        return StrategyDetailResponse.builder()
                .id(strategy.getId())
                .name(strategy.getName())
                .information(strategy.getInformation())
                .conditions(strategy.getConditions())
                .strategyType(strategy.getStrategyType().getValue())
                .indicators(indicatorResponses)
                .build();
    }
}
