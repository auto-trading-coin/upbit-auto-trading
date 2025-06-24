package com.autric.upbit.global.security.jwt;

import com.autric.upbit.global.response.code.ErrorCode;
import com.autric.upbit.global.response.exception.RestApiException;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

/**
 * JWT 토큰의 생성, 검증, 파싱 등을 담당하는 유틸리티 클래스
 * AccessToken / RefreshToken 발급
 * 토큰 유효성 검증 및 사용자 식별자 추출
 */
@Component
public class JwtProvider {
    private final SecretKey secret;
    private final long accessTokenValidity;
    private final long refreshTokenValidity;

    /**
     * 설정 값을 주입받아 초기화하는 생성자
     *
     * @param secret JWT 서명에 사용할 비밀 키
     * @param accessTokenValidity AccessToken 유효 시간
     * @param refreshTokenValidity RefreshToken 유효 시간
     */
    public JwtProvider(
            @Value("${jwt.secret}") String secret,
            @Value("${access-expired}") long accessTokenValidity,
            @Value("${refresh-expired}") long refreshTokenValidity
    ) {
        this.secret = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.accessTokenValidity = accessTokenValidity;
        this.refreshTokenValidity = refreshTokenValidity;
    }

    // 액세스 토큰 발급
    public String createAccessToken(Long memberId) {
        return Jwts.builder()
                .subject(String.valueOf(memberId))
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + accessTokenValidity))
                .signWith(secret)
                .compact();
    }

    // 리프레시 토큰 발급
    public String createRefreshToken(Long memberId) {
        return Jwts.builder()
                .subject(String.valueOf(memberId))
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + refreshTokenValidity))
                .signWith(secret)
                .compact();
    }

    // 토큰에서 사용자 ID 추출
    public Long getMemberId(String token) {
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(secret)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

            return Long.parseLong(claims.getSubject());
        } catch (JwtException | NumberFormatException e) {
            throw new RestApiException(ErrorCode.INVALID_TOKEN);
        }
    }

    // 토큰 유효성 검증
    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                    .verifyWith(secret)
                    .build()
                    .parseSignedClaims(token);
            return true;
        } catch (JwtException e) {
            throw new RestApiException(ErrorCode.INVALID_TOKEN);
        }
    }

    /**
     * 토큰 만료 여부 확인을 위한 메서드
     * 토큰 만료 시 예외 반환
     *
     * @param token
     */

    public void isTokenExpired(String token) {
        try {
            Date expiration = Jwts.parser()
                    .verifyWith(secret)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload()
                    .getExpiration();

            if (expiration.before(new Date())) {
                throw new RestApiException(ErrorCode.EXPIRED_TOKEN); // 401 Unauthorized
            }
        } catch (JwtException e) {
            throw new RestApiException(ErrorCode.INVALID_TOKEN); // 파싱 실패 시
        }
    }
}
