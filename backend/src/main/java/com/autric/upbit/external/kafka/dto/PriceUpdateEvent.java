package com.autric.upbit.external.kafka.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PriceUpdateEvent {

    /** 멱등/추적용 전역 유일 ID */
    @NotBlank
    private String eventId;

    /** 이벤트 시간(UTC, ISO-8601) */
    @NotNull
    @JsonFormat(shape = JsonFormat.Shape.STRING)
    private Instant ts;

    /** 단일 종목 ex) KRW-BTC */
    @NotBlank
    private String market;
}
