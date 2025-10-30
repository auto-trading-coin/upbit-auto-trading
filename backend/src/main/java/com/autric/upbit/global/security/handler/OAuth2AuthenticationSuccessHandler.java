package com.autric.upbit.global.security.handler;


import com.autric.upbit.domain.member.entity.Member;
import com.autric.upbit.domain.oauth.service.JwtService;
import com.autric.upbit.global.security.jwt.JwtProvider;
import com.autric.upbit.global.security.oauth2.CustomOAuth2User;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
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
    private final JwtService jwtService;

    @Value("${refresh-expired}")
    private long refreshTokenExpiration;

    @Value("${redirect-url}")
    private String frontendRedirectUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        // 로그인한 사용자 정보 추출
        CustomOAuth2User oAuth2User = (CustomOAuth2User) authentication.getPrincipal();
        Member member = oAuth2User.getMember();
        // JWT 생성
        String refreshToken = jwtProvider.createRefreshToken(member.getId());

        // Redis에 Refresh Token 저장
        jwtService.save(member.getId(), refreshToken);

        // 로그인 후, 응답 구성
        // RefreshToken을 HttpOnly 쿠키로 설정
        Cookie refreshTokenCookie = new Cookie("refreshToken", refreshToken);
//        refreshTokenCookie.setHttpOnly(true);
//        refreshTokenCookie.setSecure(true);
        refreshTokenCookie.setPath("/");
        refreshTokenCookie.setMaxAge((int) refreshTokenExpiration / 1000);
        response.addCookie(refreshTokenCookie);

        response.sendRedirect(frontendRedirectUrl);
    }
}
