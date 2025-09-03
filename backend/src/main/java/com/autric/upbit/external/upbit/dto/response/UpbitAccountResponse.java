package com.autric.upbit.external.upbit.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpbitAccountResponse {
    /** 통화 코드 (KRW, BTC, ETH...) */
    private String currency;

    /** 주문 가능 수량 또는 금액 */
    private String balance;

    /** 출금이나 주문 등에 잠겨 있는 잔액 */
    private String locked;

    /** 매수 평균가 */
    @JsonProperty("avg_buy_price")
    private String avgBuyPrice;

    /** 매수 평균가 수정 여부 */
    @JsonProperty("avg_buy_price_modified")
    private boolean avgBuyPriceModified;

    /** 평균가 기준 통화 (KRW, BTC, USDT...)*/
    @JsonProperty("unit_currency")
    private String unitCurrency;
}
