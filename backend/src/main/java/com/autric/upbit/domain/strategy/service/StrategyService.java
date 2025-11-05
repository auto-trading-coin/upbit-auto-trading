package com.autric.upbit.domain.strategy.service;

import com.autric.upbit.domain.strategy.entity.Strategy;
import com.autric.upbit.domain.strategy.repository.StrategyRepository;
import com.autric.upbit.global.response.code.ErrorCode;
import com.autric.upbit.global.response.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class StrategyService {

    private final StrategyRepository strategyRepository;

    public boolean existsById(Long id){
        return strategyRepository.existsById(id);
    }

    public Strategy getStrategy(Long id){
        return strategyRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.STRATEGY_NOT_FOUND));
    }

    public List<Strategy> getStrategies(){
        return strategyRepository.findAll();
    }
}
