package com.autric.upbit.domain.strategy.service;

import com.autric.upbit.domain.strategy.repository.StrategyRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class StrategyService {

    private final StrategyRepository strategyRepository;

    public boolean existsById(Long id){
        return strategyRepository.existsById(id);
    }
}
