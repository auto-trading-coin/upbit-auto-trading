package com.autric.upbit.domain.member.dto.response;

import com.autric.upbit.domain.member.entity.Member;
import lombok.Builder;
import lombok.Getter;

/**
 * 로그인 성공 시 클라이언트에 전달될 응답 DTO.
 * 이메일, 닉네임, 자동매매여부, 매매전략, 업비트 API와 같은 회원 정보를 포함.
 */
@Getter
@Builder
public class MemberLoginResponse {

    private String email;
    private String nickname;
    private boolean tradeActive;
    private boolean strategyRegistered;
    private boolean apiKeyRegistered;
    private Long strategyId;

    public static MemberLoginResponse fromEntity(Member member){
        return MemberLoginResponse.builder()
                .email(member.getEmail())
                .nickname(member.getNickname())
                .tradeActive(member.getTradeActive())
                .strategyRegistered(member.hasStrategy())
                .apiKeyRegistered(member.hasApiKey())
                .strategyId(member.hasStrategy() ? member.getStrategy().getId() : null)
                .build();
    }
}
