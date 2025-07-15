package com.autric.upbit.domain.oauth.controller;

import com.autric.upbit.domain.oauth.service.JwtService;
import com.autric.upbit.global.response.code.SuccessCode;
import com.autric.upbit.global.response.structure.SuccessResponse;
import com.autric.upbit.global.security.oauth2.CustomOAuth2User;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/token")
@RequiredArgsConstructor
public class TokenController {

    private final JwtService jwtService;

    /**
     * Refresh Token을 이용해 새로운 Access Token을 발급하는 API
     * 요청의 쿠키에서 refreshToken을 추출하고, 유효성을 검증한 뒤
     * Redis에 저장된 refreshToken과 일치하면 새 accessToken을 생성해 반환
     *
     * @param request HttpServletRequest (쿠키에서 refreshToken 추출용)
     * @return 새로운 accessToken 또는 오류 응답
     */
    @GetMapping
    public ResponseEntity<?> reissueAccessToken(HttpServletRequest request){
        String accessToken = jwtService.reissueAccessToken(request);
        // 새로운 accessToken을 응답으로 반환
        return SuccessResponse.createSuccess(SuccessCode.TOKEN_REISSUE_SUCCESS, accessToken);
    }

    /**
     * 로그아웃 요청을 처리하는 메서드
     *
     * 1. 현재 로그인된 사용자의 ID를 기반으로 Redis에 저장된 Refresh Token을 제거
     * 2. 클라이언트 측 쿠키에 저장된 Refresh Token을 제거 (만료 처리)
     * 3. 로그아웃 성공 응답 반환
     *
     * 인증 필요 (Access Token을 통해 인증된 사용자만 호출 가능)
     *
     * @param user 인증된 사용자의 OAuth2 사용자 정보 (@AuthenticationPrincipal 을 통해 주입)
     * @param response 클라이언트에게 쿠키 삭제 명령을 내리기 위한 HttpServletResponse 객체
     * @return 로그아웃 성공 응답
     */
    @GetMapping("logout")
    public ResponseEntity<?> deleteRefreshToken(@AuthenticationPrincipal CustomOAuth2User user, HttpServletResponse response){
        System.out.println("로그아웃 요청");
        // Redis RefreshToken 제거
        Long id = user.getMember().getId();
        jwtService.delete(id);

        // 쿠키에서 RefreshToken 제거
        Cookie expiredCookie = new Cookie("refreshToken", null);
        expiredCookie.setMaxAge(0); // 즉시 만료
        expiredCookie.setPath("/"); // 전체 경로에서 삭제
//        expiredCookie.setHttpOnly(true);
//        expiredCookie.setSecure(true); // HTTPS 환경에서만 설정
        response.addCookie(expiredCookie);

        return SuccessResponse.createSuccess(SuccessCode.LOGOUT_SUCCESS);
    }

}
