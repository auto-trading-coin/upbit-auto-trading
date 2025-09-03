package com.autric.upbit.external.kafka.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;

@Getter
@Builder
public class SignalMessage {
    /** 마켓 이름 (ex. KRW-BTC)*/
    private String market;

    /** 전략 ID (ex. 1)*/
    private Long strategy;

    /** 시장가 매수/매도 옵션 (bid : 매수 / ask : 매도)*/
    private String side;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSX", timezone = "UTC")
    private Instant timestamp;
}
