package com.autric.upbit.domain.strategy.controller;

import com.autric.upbit.domain.member.service.MemberService;
import com.autric.upbit.domain.strategy.dto.request.StrategyUpdateRequest;
import com.autric.upbit.global.response.code.SuccessCode;
import com.autric.upbit.global.response.structure.SuccessResponse;
import com.autric.upbit.global.security.oauth2.CustomOAuth2User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

@Controller
@RequiredArgsConstructor
@RequestMapping("/strategy")
public class StrategyController {

    private final MemberService memberService;

    /**
     * 사용자의 매매 전략을 변경하는 API
     * - 요청받은 전략 ID 값으로 매매 전략 업데이트
     *
     * 요청 바디: { "strategyId": 1 }
     * 응답: 매매 전략 변경 성공 여부
     */
    @PatchMapping
    public ResponseEntity<?> updateStrategy(@AuthenticationPrincipal CustomOAuth2User user, @RequestBody StrategyUpdateRequest dto){
        memberService.updateStrategy(user, dto);
        return SuccessResponse.createSuccess(SuccessCode.UPDATE_STRATEGY_SUCCESS);
    }
}
