package com.autric.upbit.external.upbit.controller;

import com.autric.upbit.domain.upbitApiKey.UpbitApiKey;
import com.autric.upbit.external.upbit.dto.response.UpbitAccountResponse;
import com.autric.upbit.external.upbit.dto.response.UpbitMarketInfoResponse;
import com.autric.upbit.external.upbit.service.UpbitProxyService;
import com.autric.upbit.global.response.code.SuccessCode;
import com.autric.upbit.global.response.structure.SuccessResponse;
import com.autric.upbit.global.security.oauth2.CustomOAuth2User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/upbit")
public class UpbitProxyController{

    private final UpbitProxyService upbitProxyService;

    @GetMapping("/markets")
    public ResponseEntity<?> getMarkets() {
        List<UpbitMarketInfoResponse> markets = upbitProxyService.getMarkets();
        return SuccessResponse.createSuccess(SuccessCode.UPBIT_MARKETS_SUCCESS, markets);
    }

    @GetMapping("/portfolio")
    public ResponseEntity<?> getAccounts(@AuthenticationPrincipal CustomOAuth2User user){
        UpbitApiKey apiKey = user.getMember().getUpbitApiKey();
        if (apiKey == null) {
            throw new IllegalStateException("업비트 API 키가 등록되지 않았습니다.");
        }
        List<UpbitAccountResponse> accounts = upbitProxyService.getAccounts(apiKey.getAccessKey(), apiKey.getSecretKey());
        return  SuccessResponse.createSuccess(SuccessCode.UPBIT_ACCOUNTS_SUCCESS, accounts);
    }
}