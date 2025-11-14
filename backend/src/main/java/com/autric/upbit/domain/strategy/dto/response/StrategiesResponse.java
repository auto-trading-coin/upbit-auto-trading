package com.autric.upbit.domain.strategy.dto.response;

import com.autric.upbit.domain.strategy.entity.Indicator;
import com.autric.upbit.domain.strategy.entity.Strategy;
import com.autric.upbit.domain.strategy.entity.StrategyIndicator;
import lombok.Builder;
import lombok.Getter;
import java.util.List;

@Getter
@Builder
public class StrategiesResponse {

    private Long id;
    private String name;
    private String information;
    private String strategyType;
    private List<String> indicators;

    public static StrategiesResponse fromEntity(Strategy strategy) {
        List<String> indicatorNames = strategy.getIndicators().stream()
                .map(StrategyIndicator::getIndicator)   // Indicator
                .map(Indicator::getName)   // "RSI"
                .distinct()
                .sorted()
                .toList();

        return StrategiesResponse.builder()
                .id(strategy.getId())
                .name(strategy.getName())
                .information(strategy.getInformation())
                .strategyType(strategy.getStrategyType().getValue())
                .indicators(indicatorNames)
                .build();
    }
}
