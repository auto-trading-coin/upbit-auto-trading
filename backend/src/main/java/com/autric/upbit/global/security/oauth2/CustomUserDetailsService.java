package com.autric.upbit.global.security.oauth2;

import com.autric.upbit.domain.member.entity.Member;
import com.autric.upbit.domain.member.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

/**
 * JWT 인증 방식에서 사용자의 인증 정보를 로드하는 서비스.
 * - Spring Security가 인증 과정 중 UserDetails 객체를 필요로 할 때 호출.
 * - JWT 토큰에 포함된 사용자 식별자(userId)를 기준으로 DB에서 사용자(Member)를 조회.
 * - 조회된 사용자 정보를 CustomUserDetails 형태로 감싸서 반환.
 *
 * 사용 위치 예시:
 * - JwtAuthenticationFilter에서 토큰을 파싱한 후 userId로 사용자 정보를 조회할 때 사용
 */

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {
    private final MemberRepository memberRepository;

    @Override
    public UserDetails loadUserByUsername(String memberId) throws UsernameNotFoundException {
        Long id = Long.parseLong(memberId);
        Member member = memberRepository.findById(id)
                .orElseThrow(() -> new UsernameNotFoundException("사용자를 찾을 수 없습니다."));

        return new CustomUserDetails(member);
    }
}
