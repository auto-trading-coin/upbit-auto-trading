package com.autric.upbit.external.upbit.dto.request;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class UpbitAuthRequest {

    private String accessKey;
    private String secretKey;
}
