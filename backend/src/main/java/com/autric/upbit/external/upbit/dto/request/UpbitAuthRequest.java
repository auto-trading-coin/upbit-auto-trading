package com.autric.upbit.external.upbit.dto.request;

import com.autric.upbit.domain.member.entity.Member;
import com.autric.upbit.domain.upbitApiKey.UpbitApiKey;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class UpbitAuthRequest {

    private String accessKey;
    private String secretKey;

    public UpbitApiKey toUpbitApiKeyEntity(Member member){
        return UpbitApiKey.builder()
                .member(member)
                .accessKey(this.accessKey)
                .secretKey(this.secretKey)
                .build();
    }
}
