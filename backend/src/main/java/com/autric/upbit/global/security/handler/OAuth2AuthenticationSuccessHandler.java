package com.autric.upbit.global.security.handler;


import com.autric.upbit.domain.member.dto.response.LoginResponse;
import com.autric.upbit.domain.member.entity.Member;
import com.autric.upbit.global.security.jwt.JwtProvider;
import com.autric.upbit.global.security.oauth2.CustomOAuth2User;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

/**
 * OAuth2 로그인 성공 시 실행되는 핸들러.
 * 인증된 사용자 정보를 바탕으로 Access Token과 Refresh Token을 생성하고,
 * 사용자 정보를 포함한 JSON 형태의 응답을 클라이언트에게 반환.
 */
@RequiredArgsConstructor
@Component
public class OAuth2AuthenticationSuccessHandler implements AuthenticationSuccessHandler {

    private final JwtProvider jwtProvider;
    private final ObjectMapper objectMapper;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {

        // 로그인한 사용자 정보 추출
        CustomOAuth2User oAuth2User = (CustomOAuth2User) authentication.getPrincipal();
        Member member = oAuth2User.getMember();

        // JWT 생성
        String accessToken = jwtProvider.createAccessToken(member.getId());
        String refreshToken = jwtProvider.createRefreshToken(member.getId());

        // 로그인 후, 응답 구성
        LoginResponse.MemberInfo memberInfo = LoginResponse.MemberInfo.builder()
                .nickname(member.getNickname())
                .email(member.getEmail())
                .tradeActive(member.getTradeActive())
                .api_key_registered(member.hasApiKey())
                .strategy_registered(member.hasStrategy())
                .build();

        LoginResponse loginResponse = LoginResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .member(memberInfo)
                .build();

        // Redis에 Refresh Token 저장 로직 구현 예정

        // JSON 응답 전송
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        objectMapper.writeValue(response.getWriter(), loginResponse);
    }
}
