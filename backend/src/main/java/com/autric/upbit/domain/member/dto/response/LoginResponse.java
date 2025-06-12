package com.autric.upbit.domain.member.dto.response;

import lombok.Builder;
import lombok.Getter;

/**
 * 로그인 성공 시 클라이언트에 전달될 응답 DTO.
 * Access Token, Refresh Token, 회원 정보를 포함.
 */
@Getter
public class LoginResponse {
    private String accessToken;
    private String refreshToken;
    private MemberInfo member;

    @Builder
    public LoginResponse(String accessToken, String refreshToken, MemberInfo member) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.member = member;
    }

    @Getter
    @Builder
    public static class MemberInfo {
        private String email;
        private String nickname;
        private boolean tradeActive;
        private boolean strategy_registered;
        private boolean api_key_registered;
    }
}
