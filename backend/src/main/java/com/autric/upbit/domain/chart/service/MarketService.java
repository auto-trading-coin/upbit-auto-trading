package com.autric.upbit.domain.chart.service;

import com.autric.upbit.domain.chart.entity.Market;
import com.autric.upbit.domain.chart.repository.MarketRepository;
import com.autric.upbit.global.response.code.ErrorCode;
import com.autric.upbit.global.response.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class MarketService {

    private final MarketRepository marketRepository;

    public Market getMarketByCoin(String coin) {
        return marketRepository.findByCoin(coin)
                .orElseThrow(() -> new BusinessException(ErrorCode.MARKET_NOT_FOUND));
    }
}
