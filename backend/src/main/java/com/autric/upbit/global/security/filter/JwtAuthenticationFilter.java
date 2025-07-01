package com.autric.upbit.global.security.filter;

import com.autric.upbit.domain.member.entity.Member;
import com.autric.upbit.domain.member.repository.MemberRepository;
import com.autric.upbit.global.response.code.ErrorCode;
import com.autric.upbit.global.response.exception.RestApiException;
import com.autric.upbit.global.security.jwt.JwtProvider;
import com.autric.upbit.global.security.oauth2.CustomOAuth2User;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.Map;

/**
 * JWT 인증 필터
 * 매 요청마다 실행되며, HTTP 헤더에 포함된 JWT를 검증하고,
 * 인증이 유효하면 SecurityContext에 인증 정보를 등록하는 역할을 수행.
 */
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {  // OncePerRequestFilter : 한번 실행 보장

    private final JwtProvider jwtProvider;
    private final MemberRepository memberRepository;
    private static final String AUTHORIZATION_HEADER = "Authorization";
    private static final String BEARER_PREFIX = "Bearer ";

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        String token = null;
        String bearer = request.getHeader(AUTHORIZATION_HEADER);

        // 헤더에 토큰이 존재하는지 확인
        if (bearer != null && bearer.startsWith("Bearer ")) {
            token =  bearer.substring(BEARER_PREFIX.length());
        }

        // 토큰이 없는 경우, 다음 필터로 넘김 (권한 없는 공개 엔드포인트 또는 미인증 요청)
        if (token == null) {
            filterChain.doFilter(request, response);
            return;
        }

        // 유효한 토큰인지 확인
        if(jwtProvider.validateToken(token)){
            Long memberId = jwtProvider.getMemberId(token);

            // DB에서 사용자 조회
            Member member = memberRepository.findById(memberId)
                    .orElseThrow(() -> new RestApiException(ErrorCode.MEMBER_NOT_FOUND));

            /**
             * CustomOAuth2User 생성 및 인증 객체 설정
             * JWT 인증은 OAuth2 로그인 과정이 아니므로, OAuth2User(=attributes 등) 정보가 없음
             * 따라서 CustomOAuth2User 생성 시 첫 번째 파라미터로 빈 자료구조로 이루어진 더미 객체 전달
             * 우리 서비스에는 특정 권한이 필요한 기능이 없기 때문에 가능한 방법
             */
            OAuth2User dummyOAuth2User = new DefaultOAuth2User(
                    List.of(),         // 권한 리스트 (필요 시 "ROLE_USER" 등 넣을 수 있음)
                    Map.of("id", member.getId()),  // attributes (적어도 하나의 키-밸류 쌍이 필요)
                    "id"               // nameAttributeKey
            );

            CustomOAuth2User customUser = new CustomOAuth2User(dummyOAuth2User, member);

            // 인증 객체 생성 (Principal(사용자 객체) = customUser, Credentials(자격 증명) = null, Authorities(권한 목록) = null)
            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(customUser, null, null);

            // SecurityContextHolder에 인증객체 등록
            SecurityContextHolder.getContext().setAuthentication(authentication);
        }

        // 다음 필터로 요청 전달
        filterChain.doFilter(request, response);
    }
}
