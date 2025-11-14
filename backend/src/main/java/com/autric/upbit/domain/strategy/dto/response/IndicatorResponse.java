package com.autric.upbit.domain.strategy.dto.response;

import com.autric.upbit.domain.strategy.entity.Indicator;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class IndicatorResponse {

    private Long id;
    private String name;
    private String description;

    public static IndicatorResponse fromEntity(Indicator indicator){
        return IndicatorResponse.builder()
                .id(indicator.getId())
                .name(indicator.getName())
                .description(indicator.getDescription())
                .build();
    }
}
