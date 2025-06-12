package com.autric.upbit.global.security.filter;

import com.autric.upbit.global.security.jwt.JwtProvider;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * JWT 인증 필터
 * 매 요청마다 실행되며, HTTP 헤더에 포함된 JWT를 검증하고,
 * 인증이 유효하면 SecurityContext에 인증 정보를 등록하는 역할을 수행.
 */
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {  // OncePerRequestFilter : 한번 실행 보장
    private final JwtProvider jwtProvider;
    private static final String AUTHORIZATION_HEADER = "Authorization";
    private static final String BEARER_PREFIX = "Bearer ";
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {

        String token = null;
        String bearer = request.getHeader(AUTHORIZATION_HEADER);

        if (bearer != null && bearer.startsWith("Bearer ")) {
            token =  bearer.substring(BEARER_PREFIX.length());
        }

        // 유효한 토큰인지 확인
        if(token != null && jwtProvider.validateToken(token)){
            Long memberId = jwtProvider.getMemberId(token);

            // 인증 객체 생성
            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(memberId, null, null);

            // SecurityContextHolder에 인증객체 등록
            SecurityContextHolder.getContext().setAuthentication(authentication);
        }

        // 다음 필터로 요청 전달
        filterChain.doFilter(request, response);
    }
}
