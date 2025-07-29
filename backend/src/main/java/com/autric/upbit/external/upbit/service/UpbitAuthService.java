package com.autric.upbit.external.upbit.service;

import com.autric.upbit.external.upbit.client.UpbitApiClient;
import com.autric.upbit.external.upbit.dto.request.UpbitRequest;
import com.autric.upbit.global.response.code.ErrorCode;
import com.autric.upbit.global.response.exception.RestApiException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class UpbitAuthService {

    private final UpbitApiClient upbitApiClient;

    /**
     * 사용자의 accessKey/secretKey가 유효한 Upbit 키인지 확인
     */
    public boolean isValidUpbitKey(UpbitRequest.UpbitAuthRequestDto dto) {
        try {
            String jwt = createUpbitJwt(dto.getAccessKey(), dto.getSecretKey());
            upbitApiClient.getAccounts(jwt); // 요청 성공 = 키 유효
            return true;
        } catch (WebClientResponseException e) {
            log.warn("업비트 API 키 유효성 실패 - 상태코드: {}, 응답: {}", e.getStatusCode(), e.getResponseBodyAsString());
            throw new RestApiException(ErrorCode.INVALID_UPBIT_API_KEY);
        } catch (Exception e) {
            log.error("업비트 키 검증 중 예상치 못한 오류 발생", e);
            throw new RestApiException(ErrorCode.INVALID_UPBIT_API_KEY);
        }
    }

    /**
     * accessKey/secretKey 기반 Upbit JWT 생성 (query 없는 요청용)
     */
    public String createUpbitJwt(String accessKey, String secretKey) {
        String nonce = UUID.randomUUID().toString();

        Map<String, Object> claims = new HashMap<>();
        claims.put("access_key", accessKey);
        claims.put("nonce", nonce);

        // 시크릿 키를 64바이트(512비트)로 패딩
        byte[] keyBytes = Arrays.copyOf(secretKey.getBytes(StandardCharsets.UTF_8), 64);
        SecretKey key = Keys.hmacShaKeyFor(keyBytes);

        return Jwts.builder()
                .setHeaderParam("typ", "JWT")
                .setClaims(claims)
                .signWith(key, SignatureAlgorithm.HS512)
                .compact();
    }

}
