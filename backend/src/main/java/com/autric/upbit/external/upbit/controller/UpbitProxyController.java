package com.autric.upbit.external.upbit.controller;

import com.autric.upbit.external.upbit.dto.response.UpbitMarketInfoResponse;
import com.autric.upbit.external.upbit.service.UpbitMarketService;
import com.autric.upbit.global.response.code.SuccessCode;
import com.autric.upbit.global.response.structure.SuccessResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/upbit")
public class UpbitProxyController{

    private final UpbitMarketService upbitMarketService;

    @GetMapping("/markets")
    public ResponseEntity<?> getMarkets() {
        List<UpbitMarketInfoResponse> markets = upbitMarketService.getMarkets();
        return SuccessResponse.createSuccess(SuccessCode.UPBIT_MARKETS_SUCCESS, markets);
    }
}