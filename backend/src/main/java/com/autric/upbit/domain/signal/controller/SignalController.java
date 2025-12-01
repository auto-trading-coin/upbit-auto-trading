package com.autric.upbit.domain.signal.controller;

import com.autric.upbit.domain.signal.dto.response.SignalListResponse;
import com.autric.upbit.domain.signal.service.SignalService;
import com.autric.upbit.global.response.code.SuccessCode;
import com.autric.upbit.global.response.structure.SuccessResponse;
import com.autric.upbit.global.security.oauth2.CustomOAuth2User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/signal")
@RequiredArgsConstructor
public class SignalController {

    private final SignalService signalService;

    /**
     * 시그널 로그 조회 (무한 스크롤)
     */
    @GetMapping
    public ResponseEntity<?> getSignalLogs(
            @AuthenticationPrincipal CustomOAuth2User user,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        SignalListResponse response = signalService.getSignalsByMember(user.getMember().getId(), page, size);
        return SuccessResponse.createSuccess(SuccessCode.SIGNAL_LIST_SUCCESS, response);
    }
}
