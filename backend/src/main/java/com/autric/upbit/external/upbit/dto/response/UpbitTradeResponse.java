package com.autric.upbit.external.upbit.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class UpbitTradeResponse {

    private String market;
    private String uuid;
    private String price;
    private String volume;
    private String funds;
    private String side;

    @JsonProperty("created_at")
    private String createdAt;
}
