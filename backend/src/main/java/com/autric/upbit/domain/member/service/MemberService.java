package com.autric.upbit.domain.member.service;

import com.autric.upbit.domain.member.dto.response.MemberLoginResponse;
import com.autric.upbit.domain.member.dto.response.MemberTradeActiveResponse;
import com.autric.upbit.domain.strategy.dto.request.StrategyUpdateRequest;
import com.autric.upbit.domain.strategy.entity.Strategy;
import com.autric.upbit.domain.strategy.repository.StrategyRepository;
import com.autric.upbit.domain.upbitApiKey.UpbitApiKey;
import com.autric.upbit.domain.upbitApiKey.UpbitApiKeyRepository;
import com.autric.upbit.external.upbit.dto.request.UpbitAuthRequest;
import com.autric.upbit.global.response.code.ErrorCode;
import com.autric.upbit.domain.member.entity.Member;
import com.autric.upbit.domain.member.repository.MemberRepository;
import com.autric.upbit.global.response.exception.BusinessException;
import com.autric.upbit.global.security.oauth2.CustomOAuth2User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MemberService {

    private final MemberRepository memberRepository;
    private final StrategyRepository strategyRepository;
    private final UpbitApiKeyRepository upbitApiKeyRepository;

    public MemberLoginResponse getLoginData(CustomOAuth2User user){
        Member member = user.getMember();

        return MemberLoginResponse.fromEntity(member);
    }

    @Transactional
    public MemberTradeActiveResponse updateTradeActive(CustomOAuth2User user, boolean status){
        long memberId = user.getMember().getId();

        // member 객체를 JPA 영속 상태로 만들기 위해 DB 조회
        Member member = memberRepository.findById(memberId).orElseThrow(
                () -> new BusinessException(ErrorCode.MEMBER_NOT_FOUND));

        // 자동매매를 실행했지만, 업비트 api키가 등록되지 않은 상태
        if (status && !member.hasApiKey()) {
            throw new BusinessException(ErrorCode.UPBIT_API_KEY_NOT_FOUND);
        }

        // 더티체킹으로 인해 변경사항 발생 시 자동으로 DB 반영
        member.updateTradeActive(status);
        return MemberTradeActiveResponse.of(status);
    }

    @Transactional
    public void registerUpbitApiKey(CustomOAuth2User user, UpbitAuthRequest dto) {
        // accessKey 중복 검사
        if (upbitApiKeyRepository.existsByAccessKey(dto.getAccessKey())) {
            throw new BusinessException(ErrorCode.DUPLICATE_UPBIT_API_KEY);
        }

        Member member = memberRepository.findById(user.getMember().getId())
                .orElseThrow(() -> new BusinessException(ErrorCode.MEMBER_NOT_FOUND));

        if (member.getUpbitApiKey() != null) {
            throw new BusinessException(ErrorCode.DUPLICATE_UPBIT_API_KEY);
        }

        UpbitApiKey apiKey = dto.toUpbitApiKeyEntity(member);

        member.registerUpbitApiKey(apiKey);
        upbitApiKeyRepository.save(apiKey);
    }

    @Transactional
    public void deleteUpbitApiKey(CustomOAuth2User user) {
        Member member = memberRepository.findById(user.getMember().getId())
                .orElseThrow(() -> new BusinessException(ErrorCode.MEMBER_NOT_FOUND));

        // 자동매매가 실행 중인 경우 예외 처리
        if (member.getTradeActive()) {
            throw new BusinessException(ErrorCode.API_KEY_DELETE_CONFLICT);
        }
        member.deleteUpbitApiKey();
    }

    @Transactional
    public void updateStrategy(CustomOAuth2User user, StrategyUpdateRequest dto) {
        Long id = dto.getStrategyId();
        // 존재하지 않는 유저
        Member member = memberRepository.findById(user.getMember().getId())
                .orElseThrow(() -> new BusinessException(ErrorCode.MEMBER_NOT_FOUND));

        // 존재하지 않는 전략
        Strategy strategy = strategyRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.STRATEGY_NOT_FOUND));

        member.updateStrategy(strategy);
    }

    /**
     * 활성 구독자 조회
     */
    public List<Member> getActiveSubscribers(Long strategyId) {
        return memberRepository.findActiveMembersByStrategyId(strategyId);
    }
}
