package com.autric.upbit.domain.oauth.service;

import com.autric.upbit.global.response.code.ErrorCode;
import com.autric.upbit.global.response.exception.RestApiException;
import com.autric.upbit.global.security.jwt.JwtProvider;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import java.util.concurrent.TimeUnit;

/**
 * 회원의 Refresh Token을 Redis에 저장, 조회, 삭제하는 역할을 담당하는 서비스.
 * RT:<memberId> 형식의 Key로 Redis에 저장되며, 토큰 재발급 및 로그아웃 처리를 담당.
 */
@Service
@RequiredArgsConstructor
public class JwtService {

    private final StringRedisTemplate redisTemplate;
    private final JwtProvider jwtProvider;
    private static final String REFRESH_TOKEN_PREFIX = "RT:";  // Refresh Token 약자를 접두어로 키 구분
    @Value("${refresh-expired}")
    private long refreshTokenExpiration;

    /**
     * Refresh Token을 Redis에 저장
     * Key: "RT:{memberId}"
     *
     * @param memberId 사용자 고유 ID
     * @param refreshToken 저장할 Refresh Token 문자열
     */
    public void save(Long memberId, String refreshToken) {
        String key = REFRESH_TOKEN_PREFIX + memberId;
        long expirationSeconds = refreshTokenExpiration / 1000;  // 기존 밀리초 단위를 초 단위로 변환
        redisTemplate.opsForValue().set(key, refreshToken, expirationSeconds, TimeUnit.SECONDS);
    }

    /**
     * Redis에서 해당 사용자의 Refresh Token을 조회
     *
     * @param memberId 사용자 고유 ID
     * @return 저장된 Refresh Token (없으면 null)
     */
    public String get(Long memberId) {
        return redisTemplate.opsForValue().get(REFRESH_TOKEN_PREFIX + memberId);
    }

    /**
     * Redis에서 해당 사용자의 Refresh Token을 삭제
     * 로그아웃 또는 토큰 재발급 시 사용
     *
     * @param memberId 사용자 고유 ID
     */
    public void delete(Long memberId) {
        redisTemplate.delete(REFRESH_TOKEN_PREFIX + memberId);
    }

    /**
     * Redis에 저장된 Refresh Token과 주어진 토큰이 일치하는지 확인
     *
     * @param memberId 사용자 고유 ID
     * @param refreshToken 요청에서 받은 Refresh Token
     * @return 일치 여부
     */
    public boolean isValid(Long memberId, String refreshToken) {
        String stored = get(memberId);
        return stored != null && stored.equals(refreshToken);
    }

    /**
     * 클라이언트로부터 전달받은 쿠키에서 Refresh Token을 추출하여
     * 해당 토큰의 유효성과 Redis 저장값 일치 여부를 검증한 뒤,
     * Access Token을 재발급하여 반환하는 메서드.
     *
     * 예외 상황:
     * Refresh Token이 없거나 유효하지 않을 경우 에러 반환
     * Redis에 저장된 Refresh Token과 일치하지 않을 경우 에러 반환
     *
     * @param request HTTP 요청 객체 (쿠키 접근용)
     * @return 새로 생성된 Access Token 문자열
     */
    public String reissueAccessToken(HttpServletRequest request) {
        String refreshToken = extractRefreshTokenFromCookie(request);
        if (refreshToken == null || !jwtProvider.validateToken(refreshToken)) {
            throw new RestApiException(ErrorCode.INVALID_TOKEN);
        }

        Long memberId = jwtProvider.getMemberId(refreshToken);

        if (!isValid(memberId, refreshToken)) {
            throw new RestApiException(ErrorCode.INVALID_TOKEN);
        }

        return jwtProvider.createAccessToken(memberId);
    }

    /**
     * 요청의 쿠키 배열에서 이름이 "refreshToken"인 쿠키 값을 추출.
     * 해당 값이 없으면 null 반환.
     *
     * @param request HttpServletRequest
     * @return 쿠키에서 추출한 refreshToken 값 (없으면 null)
     */
    private String extractRefreshTokenFromCookie(HttpServletRequest request) {
        if(request.getCookies() == null) return null;

        for(Cookie cookie: request.getCookies()){
            if("refreshToken".equals(cookie.getName())){
                return cookie.getValue();
            }
        }
        return null;
    }

}
