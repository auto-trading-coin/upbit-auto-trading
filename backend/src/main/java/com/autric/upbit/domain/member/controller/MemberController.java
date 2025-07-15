package com.autric.upbit.domain.member.controller;

import com.autric.upbit.domain.member.service.MemberService;
import com.autric.upbit.global.response.code.SuccessCode;
import com.autric.upbit.global.response.structure.SuccessResponse;
import com.autric.upbit.global.security.oauth2.CustomOAuth2User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/member")
public class MemberController {

    private final MemberService memberService;

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentMember(@AuthenticationPrincipal CustomOAuth2User user){
        return SuccessResponse.createSuccess(SuccessCode.MEMBER_INFO_SUCCESS, memberService.getLoginData(user));
    }
}
