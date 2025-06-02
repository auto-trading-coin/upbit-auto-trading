package com.autric.upbit.global.security.oauth2;

import com.autric.upbit.domain.member.entity.Member;
import com.autric.upbit.domain.member.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.Map;

@RequiredArgsConstructor
@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final MemberRepository memberRepository;
    @Override
    @Transactional
    public OAuth2User loadUser(OAuth2UserRequest userRequest) {
        // 기본 OAuth2 서비스로 사용자 정보 받아옴
        OAuth2User oAuth2User = super.loadUser(userRequest);

        // 공급자 이름(kakao)
        String registrationId = userRequest.getClientRegistration().getRegistrationId();

        // 고유 식별자 키 application.yml (user-name-attribute)
        String userNameAttributeName = userRequest.getClientRegistration()
                .getProviderDetails().getUserInfoEndpoint().getUserNameAttributeName();  // id

        // 카카오 응답 데이터
        Map<String, Object> attributes = oAuth2User.getAttributes();

        // JSON 파싱
        if(registrationId.equals("kakao")){
            @SuppressWarnings("unchecked")  // 형 변환이 확실하므로 unchecked cast 경고 무시
            Map<String, Object> kakaoAccount = (Map<String, Object>) attributes.get("kakao_account");

            @SuppressWarnings("unchecked")
            Map<String, Object> profile = (Map<String, Object>) kakaoAccount.get("profile");

            Long kakaoId = ((Number) attributes.get("id")).longValue();
            String email = (String) kakaoAccount.get("email");
            String nickname = (String) profile.get("nickname");

            Member member = memberRepository.findByProviderAndProviderId("kakao", kakaoId)
                    .orElseGet(() -> {
                        Member newMember = Member.builder()
                                .email(email)
                                .nickname(nickname)
                                .provider("kakao")
                                .providerId(kakaoId)
                                .tradeActive(false)
                                .build();
                        return memberRepository.save(newMember);
                    });

            return new CustomOAuth2User(oAuth2User, member);
        }
        return oAuth2User;
    }
}
