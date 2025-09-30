package com.autric.upbit.external.upbit.dto.response;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@JsonIgnoreProperties(ignoreUnknown = true)  // 없는 필드는 무시(필요한 필드만 받아서 사용)
public class UpbitTradePriceResponse {

    @JsonProperty("trade_price")
    BigDecimal tradePrice;
}
