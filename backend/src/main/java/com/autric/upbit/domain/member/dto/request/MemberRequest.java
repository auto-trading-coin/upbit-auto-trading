package com.autric.upbit.domain.member.dto.request;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

public class MemberRequest {

    @Getter
    @NoArgsConstructor(access = AccessLevel.PRIVATE)
    public static class tradeActiveDto {
        boolean tradeActive;
    }
}
