package com.autric.upbit.domain.member.service;

import com.autric.upbit.domain.member.dto.response.MemberResponse;
import com.autric.upbit.external.upbit.dto.request.UpbitRequest;
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

        // 자동매매를 실행했지만, 업비트 api키가 등록되지 않은 상태
        if(status && member.getAccessKey() == null) throw new RestApiException(ErrorCode.UPBIT_API_KEY_NOT_FOUND);

        // 더티체킹으로 인해 변경사항 발생 시 자동으로 DB 반영
        member.updateTradeActive(status);
    }

    @Transactional
    public void registerUpbitApiKey(CustomOAuth2User user, UpbitRequest.UpbitAuthRequestDto dto) {
        String accessKey = dto.getAccessKey();
        String secretKey = dto.getSecretKey();

        // accessKey 중복 검사
        if (memberRepository.existsByAccessKey(accessKey)) {
            throw new RestApiException(ErrorCode.DUPLICATE_UPBIT_API_KEY);
        }

        Member member = memberRepository.findById(user.getMember().getId())
                .orElseThrow(() -> new RestApiException(ErrorCode.MEMBER_NOT_FOUND));

        // 키 저장
        // JPA 더티체킹으로 자동 DB 반영
        member.setUpbitApiKey(accessKey, secretKey);  // 암호화 예정
    }

}
