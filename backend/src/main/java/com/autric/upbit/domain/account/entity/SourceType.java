package com.autric.upbit.domain.account.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonValue;

@JsonFormat(shape = JsonFormat.Shape.OBJECT)
public enum SourceType {
    DAILY("daily"),
    WEEKLY("weekly"),
    MONTHLY("monthly"),
    YEARLY("yearly") ;

    private final String value;

    SourceType(String value) {
        this.value = value;
    }

    @JsonValue
    public String getLabel() {
        return value;
    }

}
