package com.autric.upbit.global.security.oauth2;

import com.autric.upbit.domain.member.entity.Member;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;

/**
 * Spring Security에서 인증된 사용자 정보를 나타내는 클래스
 *
 * - 소셜 로그인 사용자(Member 엔티티)를 UserDetails로 감싸서 스프링 시큐리티 인증 객체로 사용.
 * - SecurityContextHolder에 저장되는 Authentication 객체 내부에 포함 됨.
 * - 이 클래스를 통해 컨트롤러나 서비스 계층에서 인증된 사용자 정보(member)를 쉽게 꺼내올 수 있음.
 *
 * 구현 목적:
 * - 소셜 로그인 기반 사용자 인증을 지원하기 위해 CustomUserDetails를 정의
 * - UserDetailsService 또는 JWT 필터에서 인증 완료 시 Authentication 객체로 사용
 */

@Getter
public class CustomUserDetails implements UserDetails {

    private final Member member;

    public CustomUserDetails(Member member) {
        this.member = member;
    }

    // 사용자 권한 반환 - 단일 권한 "ROLE_USER" 부여
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Collections.singleton(() -> "ROLE_USER");
    }

    // 소셜 로그인 기반이므로 비밀번호는 사용하지 않음
    @Override
    public String getPassword() {
        return null;
    }

    // Spring Security가 사용하는 username -> 회원 고유 ID를 문자열로 반환
    @Override
    public String getUsername() {
        return String.valueOf(member.getId());
    }

    // 계정 만료 여부 - 항상 유효
    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    // 계정 잠금 여부 - 항상 사용 가능
    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    // 자격 증명(비밀번호 등) 만료 여부 - 항상 유효
    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    // 계정 활성화 여부 - 항상 활성 상태
    @Override
    public boolean isEnabled() {
        return true;
    }
}
