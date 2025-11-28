package com.autric.upbit.external.upbit.service;

import com.autric.upbit.external.upbit.client.UpbitApiClient;
import com.autric.upbit.external.upbit.dto.response.UpbitMarketInfoResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UpbitMarketService {

    private final UpbitApiClient upbitApiClient;

    public List<UpbitMarketInfoResponse> getMarkets() {
        return upbitApiClient.getMarkets();
    }
}
