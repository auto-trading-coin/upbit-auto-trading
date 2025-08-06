package com.autric.upbit.domain.member.service;

import com.autric.upbit.domain.member.dto.response.MemberLoginResponse;
import com.autric.upbit.domain.member.dto.response.MemberTradeActiveResponse;
import com.autric.upbit.domain.strategy.dto.request.StrategyUpdateRequest;
import com.autric.upbit.domain.strategy.entity.Strategy;
import com.autric.upbit.domain.strategy.repository.StrategyRepository;
import com.autric.upbit.external.upbit.dto.request.UpbitAuthRequest;
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
    private final StrategyRepository strategyRepository;

    public MemberLoginResponse getLoginData(CustomOAuth2User user){
        Member member = user.getMember();

        return MemberLoginResponse.fromEntity(member);
    }

    @Transactional
    public MemberTradeActiveResponse updateTradeActive(CustomOAuth2User user, boolean status){
        long memberId = user.getMember().getId();

        // member 객체를 JPA 영속 상태로 만들기 위해 DB 조회
        Member member = memberRepository.findById(memberId).orElseThrow(
                ()-> new RestApiException(ErrorCode.MEMBER_NOT_FOUND)
        );

        // 자동매매를 실행했지만, 업비트 api키가 등록되지 않은 상태
        if(status && member.getAccessKey() == null) throw new RestApiException(ErrorCode.UPBIT_API_KEY_NOT_FOUND);

        // 더티체킹으로 인해 변경사항 발생 시 자동으로 DB 반영
        member.updateTradeActive(status);
        return MemberTradeActiveResponse.of(status);
    }

    @Transactional
    public void registerUpbitApiKey(CustomOAuth2User user, UpbitAuthRequest dto) {
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

    @Transactional
    public void deleteUpbitApiKey(CustomOAuth2User user){
        Member member = memberRepository.findById(user.getMember().getId())
                .orElseThrow(()-> new RestApiException(ErrorCode.MEMBER_NOT_FOUND));

        // 자동매매가 실행중이라면 에러 발생
        if(member.getTradeActive()) {
            throw new RestApiException(ErrorCode.API_KEY_DELETE_CONFLICT);
        }
        member.deleteUpbitApiKey();
    }

    @Transactional
    public void updateStrategy(CustomOAuth2User user, StrategyUpdateRequest dto){
        Long id = dto.getStrategyId();
        Strategy strategy = strategyRepository.findById(id)
                .orElseThrow(() -> new RestApiException(ErrorCode.STRATEGY_NOT_FOUND));

        Member member = memberRepository.findById(user.getMember().getId())
                .orElseThrow(() -> new RestApiException(ErrorCode.MEMBER_NOT_FOUND));

        member.updateStrategy(strategy);
    }
}
