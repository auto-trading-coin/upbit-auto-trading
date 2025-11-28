package com.autric.upbit.external.upbit.dto.response;


import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 업비트 마켓 목록 API 응답
 * GET /v1/market/all
 */
@Getter
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class UpbitMarketInfoResponse {

    @JsonProperty("market")
    private String market;  // KRW-BTC

    @JsonProperty("korean_name")
    private String koreanName;  // 비트코인

    @JsonProperty("english_name")
    private String englishName;  // Bitcoin
}
