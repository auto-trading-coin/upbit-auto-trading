package com.autric.upbit.external.upbit.dto.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

public class UpbitRequest {

    @Getter
    @AllArgsConstructor
    @NoArgsConstructor
    public static class UpbitAuthRequestDto {

        private String accessKey;
        private String secretKey;
    }
}
