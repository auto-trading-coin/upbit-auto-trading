package com.autric.upbit.domain.member.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class MemberTradeActiveResponse {

    private boolean tradeActive;

    // 정적 팩토리 메서드
    public static MemberTradeActiveResponse of(boolean status) {
        return new MemberTradeActiveResponse(status);
    }

}
