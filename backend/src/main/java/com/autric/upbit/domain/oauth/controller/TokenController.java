package com.autric.upbit.domain.oauth.controller;

import com.autric.upbit.domain.oauth.service.JwtService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/token")
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
    @RequestMapping("refresh")
    public ResponseEntity<?> refreshAccessToken(HttpServletRequest request){

        String refreshToken = jwtService.reissueAccessToken(request);

        // 새로운 accessToken을 응답으로 반환
        return ResponseEntity.ok().body(refreshToken);
    }
}
