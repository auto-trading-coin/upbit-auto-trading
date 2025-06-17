package com.autric.upbit.domain.oauth.service;

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
}
