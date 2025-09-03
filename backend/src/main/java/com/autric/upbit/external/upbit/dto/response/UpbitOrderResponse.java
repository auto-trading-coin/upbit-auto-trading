package com.autric.upbit.external.upbit.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class UpbitOrderResponse {

    /** 페어(거래쌍)의 코드 (Ex. KRW-BTC) */
    private String market;

    /** 주문의 유일 식별자 */
    private String uuid;

    /** 주문 방향(매수 : bid / 매도 : ask) */
    private String side;

    /** 주문 유형 */
    @JsonProperty("ord_type")
    private String ordType;

    /** 주문 단가 또는 총액 */
    private String price;

    /** 주문 상태 (wait, watch, done, cancel) */
    private String state;

    /** 주문 생성 시각 (KST 기준), [형식] yyyy-MM-ddTHH:mm:ss+09:00 */
    @JsonProperty("crate_At")
    private String createdAt;

    /** 주문 요청 수량 */
    private String volume;

    /** 체결 후 남은 주문 양 */
    @JsonProperty("remaining_volume")
    private String remainingVolume;

    /** 수수료로 예약된 비용 */
    @JsonProperty("reserved_fee")
    private String reservedFee;

    /** 남은 수수료 */
    @JsonProperty("remaining_fee")
    private String remainingFee;

    /** 사용된 수수료 */
    @JsonProperty("paid_fee")
    private String paidFee;

    /** 거래에 사용 중인 비용 */
    private String locked;

    /** 체결된 양 */
    @JsonProperty("executed_volume")
    private String executedVolume;

    /** 자전거래 방지로 인해 취소된 수량. */
    @JsonProperty("prevented_volume")
    private String preventedVolume;

    /** 자전거래 방지로 인해 해제된 자산 */
    @JsonProperty("prevented_locked")
    private String preventedLocked;

    /** 해당 주문에 대한 체결 건수 */
    @JsonProperty("trades_count")
    private String tradesCount;
}
