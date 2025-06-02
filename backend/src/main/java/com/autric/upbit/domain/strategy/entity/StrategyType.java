package com.autric.upbit.domain.strategy.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonValue;

@JsonFormat(shape = JsonFormat.Shape.OBJECT)
public enum StrategyType {
    REVERSAL("추세반전형"),
    TREND_FOLLOWING("추세추종형"),
    MEAN_REVERSION("평균회귀형"),
    CONTRA_TREND("추세역추종형");

    private final String value;

    StrategyType(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

}
