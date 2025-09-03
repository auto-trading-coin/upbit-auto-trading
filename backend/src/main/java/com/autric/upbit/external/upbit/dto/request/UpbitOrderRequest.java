package com.autric.upbit.external.upbit.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class UpbitOrderRequest {

    /** 주문을 생성하고자 하는 대상 페어(거래쌍) */
    private String market;

    /** 주문 방향(매수 : bid / 매도 : ask) */
    private String side;

    /** 주문 유형.
     * price: 시장가 매수 주문
     * market: 시장가 매도 주문
     * */
    @JsonProperty("ord_type")
    private String ordType;

    /** 주문 단가 또는 총액. */
    private String price;    // KRW 금액

    /** 주문 수량 */
    private String volume;   // 시장가 매수에서는 null
}
