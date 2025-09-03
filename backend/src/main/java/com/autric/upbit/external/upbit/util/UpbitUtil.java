package com.autric.upbit.external.upbit.util;

import com.auth0.jwt.JWT;
import com.auth0.jwt.JWTCreator;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;
import com.auth0.jwt.algorithms.Algorithm;
import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.*;

@Component
public class UpbitUtil {

    /** accessKey/secretKey 기반 Upbit 서명 헤더 생성 (query 없는 요청용)
     *
     * @param accessKey
     * @param secretKey
     * @return
     */
    public String createUpbitJwt(String accessKey, String secretKey) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("access_key", accessKey);
        claims.put("nonce", UUID.randomUUID().toString());

        SecretKey key = Keys.hmacShaKeyFor(secretKey.getBytes(StandardCharsets.UTF_8));
        return Jwts.builder()
                .setHeaderParam("typ", "JWT")
                .setClaims(claims)
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    /** accessKey/secretKey 기반 Upbit 서명 헤더 생성 (query 있는 요청용)
     *
     * @param accessKey
     * @param secretKey
     * @param params
     * @return
     */
    public String createUpbitJwt(String accessKey, String secretKey, Map<String, String> params) {
        StringBuilder sb = new StringBuilder();
        boolean first = true;
        for (Map.Entry<String, String> e : params.entrySet()) {
            if (e.getValue() == null) continue;
            if (!first) sb.append("&");
            sb.append(e.getKey()).append("=").append(String.valueOf(e.getValue()));
            first = false;
        }
        String query = sb.toString();

        // SHA-512 해시
        String queryHash = sha512Hex(query);

        Algorithm algorithm = Algorithm.HMAC256(secretKey);

        // JWT 빌드
        JWTCreator.Builder builder = JWT.create()
                .withClaim("access_key", accessKey)
                .withClaim("nonce", UUID.randomUUID().toString());

        if (queryHash != null && !queryHash.isEmpty()) {
            builder.withClaim("query_hash", queryHash);
            builder.withClaim("query_hash_alg", "SHA512");
        }
        return builder.sign(algorithm);
    }

    /**
     * 문자열을 입력 받아 Hash 생성
     */
    private String sha512Hex(String query) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-512");
            md.update(query.getBytes("UTF-8"));
            return  HexFormat.of().formatHex(md.digest());
        } catch (Exception e) {
            throw new IllegalStateException("Failed to hash query", e);
        }
    }
}
