package com.autric.upbit.global.security.oauth2;

import com.autric.upbit.domain.member.entity.Member;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.core.user.OAuth2User;
import java.util.Collection;
import java.util.Map;

public class CustomOAuth2User implements OAuth2User {

    private final OAuth2User oAuth2User;  // 카카오 attributes, 권한 등
    private final Member member;  // DB에서 조회한 사용자

    public CustomOAuth2User(OAuth2User oAuth2User, Member member) {
        this.oAuth2User = oAuth2User;
        this.member = member;
    }

    @Override
    public Map<String, Object> getAttributes() {
        return oAuth2User.getAttributes();
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return oAuth2User.getAuthorities();
    }

    @Override
    public String getName() {  // 고유 식별자 반환, 카카오 -> "id"
        return oAuth2User.getName();
    }

    public Member getMember() {
        return member;
    }
}
