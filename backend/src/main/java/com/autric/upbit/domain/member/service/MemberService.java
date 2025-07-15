package com.autric.upbit.domain.member.service;

import com.autric.upbit.domain.member.dto.response.LoginResponse;
import com.autric.upbit.domain.member.entity.Member;
import com.autric.upbit.global.security.oauth2.CustomOAuth2User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MemberService {

    public LoginResponse getLoginData(CustomOAuth2User oAuth2User){
        Member member = oAuth2User.getMember();

        return LoginResponse.builder()
                .email(member.getEmail())
                .nickname(member.getNickname())
                .tradeActive(member.getTradeActive())
                .strategyRegistered(member.hasStrategy())
                .apiKeyRegistered(member.hasApiKey())
                .build();
    }
}
