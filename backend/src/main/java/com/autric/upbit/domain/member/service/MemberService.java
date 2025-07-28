package com.autric.upbit.domain.member.service;

import com.autric.upbit.domain.member.dto.response.MemberResponse;
import com.autric.upbit.global.response.code.ErrorCode;
import com.autric.upbit.domain.member.entity.Member;
import com.autric.upbit.domain.member.repository.MemberRepository;
import com.autric.upbit.global.response.exception.RestApiException;
import com.autric.upbit.global.security.oauth2.CustomOAuth2User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class MemberService {

    private final MemberRepository memberRepository;

    public MemberResponse.LoginResponse getLoginData(CustomOAuth2User oAuth2User){
        Member member = oAuth2User.getMember();

        return MemberResponse.LoginResponse.builder()
                .email(member.getEmail())
                .nickname(member.getNickname())
                .tradeActive(member.getTradeActive())
                .strategyRegistered(member.hasStrategy())
                .apiKeyRegistered(member.hasApiKey())
                .build();
    }

    @Transactional
    public void updateTradeActive(CustomOAuth2User oAuth2User, boolean status){
        long memberId = oAuth2User.getMember().getId();

        // member 객체를 JPA 영속 상태로 만들기 위해 DB 조회
        Member member = memberRepository.findById(memberId).orElseThrow(
                ()-> new RestApiException(ErrorCode.MEMBER_NOT_FOUND)
        );
        // 더티체킹으로 인해 변경사항 발생 시 자동으로 DB 반영
        member.updateTradeActive(status);
    }
}
