package com.autric.upbit.domain.member.controller;

import com.autric.upbit.domain.member.dto.request.MemberRequest;
import com.autric.upbit.domain.member.service.MemberService;
import com.autric.upbit.external.upbit.dto.request.UpbitRequest;
import com.autric.upbit.external.upbit.service.UpbitAuthService;
import com.autric.upbit.global.response.code.SuccessCode;
import com.autric.upbit.global.response.structure.SuccessResponse;
import com.autric.upbit.global.security.oauth2.CustomOAuth2User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/member")
public class MemberController {

    private final MemberService memberService;
    private final UpbitAuthService upbitAuthService;

    /**
     * 현재 로그인한 사용자의 정보를 조회하는 API
     * - JWT 인증 필터를 통해 인증된 사용자 정보를 기반으로 회원 정보를 응답
     * - 로그인 시 유저 정보 획득을 위해 자동으로 호출될 API
     *
     * 응답: 회원 이메일, 닉네임, 자동매매 상태 등
     */
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentMember(@AuthenticationPrincipal CustomOAuth2User user){
        return SuccessResponse.createSuccess(SuccessCode.MEMBER_INFO_SUCCESS, memberService.getLoginData(user));
    }

    /**
     * 현재 로그인한 사용자의 자동매매 상태를 수정하는 API
     * - JWT 인증 필터를 통해 인증된 사용자 정보를 기반으로 DB에서 영속 상태의 사용자 엔티티 조회
     * - 요청된 상태 값으로 자동매매 여부를 업데이트
     *
     * 요청 바디: { "tradeActive": true or false }
     * 응답: 자동매매 상태 변경 성공 여부
     */
    @PatchMapping("/trade-active")
    public ResponseEntity<?> updateTradeActive(@AuthenticationPrincipal CustomOAuth2User user, @RequestBody MemberRequest.tradeActiveDto dto){
        memberService.updateTradeActive(user, dto.isTradeActive());
        return SuccessResponse.createSuccess(SuccessCode.UPDATE_TRADE_ACTIVE_SUCCESS);
    }

    /**
     * 사용자의 업비트 API KEY를 등록하는 API
     * - 입력된 엑세스, 시크릿키로 업비트 내 자산 조회 API 호출
     * 호출 성공 -> 유효한 API KEY
     * 호출 실패 -> 유효하지 않은 API KEY
     *
     * 요청 바디: { "accessKey", "secretKey" }
     * 응답: 업비트 API KEY 등록 여부
     */
    @PutMapping("/upbit-api-key")
    public ResponseEntity<?> upbitApiKeyRegistration(@AuthenticationPrincipal CustomOAuth2User user, @RequestBody UpbitRequest.UpbitAuthRequestDto dto){
        // 유효한 API KEY 검증
        upbitAuthService.isValidUpbitKey(dto);
        // API KEY 중복 확인 및 저장
        memberService.registerUpbitApiKey(user, dto);

        return SuccessResponse.createSuccess(SuccessCode.REGISTER_UPBIT_API_KEY_SUCCESS);
    }

}
