package com.autric.upbit.domain.strategy.controller;

import com.autric.upbit.domain.member.service.MemberService;
import com.autric.upbit.domain.strategy.dto.request.StrategyUpdateRequest;
import com.autric.upbit.domain.strategy.dto.response.StrategiesResponse;
import com.autric.upbit.domain.strategy.dto.response.StrategyDetailResponse;
import com.autric.upbit.domain.strategy.service.StrategyService;
import com.autric.upbit.global.response.code.SuccessCode;
import com.autric.upbit.global.response.structure.SuccessResponse;
import com.autric.upbit.global.security.oauth2.CustomOAuth2User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@Controller
@RequiredArgsConstructor
@RequestMapping("/strategy")
public class StrategyController {

    private final MemberService memberService;
    private final StrategyService strategyService;

    /**
     * 선택 가능한 모든 전략을 조회하는 API
     *
     * 응답: 전략 조회 성공 여부, 조회된 전략 리스트
     */
    @GetMapping
    public ResponseEntity<?> getStrategies(){
        List<StrategiesResponse> strategies = strategyService.getStrategies();
        return SuccessResponse.createSuccess(SuccessCode.STRATEGIES_INFO_SUCCESS, strategies);
    }

    /**
     * 선택한 전략의 상세 내용을 조회하는 API
     *
     * 쿼리 파라미터 : id=1
     * 응답: 전략 개별 조회 성공 여부, 전략 상세 내용
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getStrategyDetail(@PathVariable Long id){
        StrategyDetailResponse strategyDetail = strategyService.getStrategyDetail(id);
        return SuccessResponse.createSuccess(SuccessCode.STRATEGY_DETAIL_INFO_SUCCESS, strategyDetail);
    }


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
        log.info("patch 요청 받음 {}", dto.getStrategyId());
        return SuccessResponse.createSuccess(SuccessCode.UPDATE_STRATEGY_SUCCESS);
    }
}
