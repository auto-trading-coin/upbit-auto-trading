package com.autric.upbit.domain.strategy.service;

import com.autric.upbit.domain.strategy.dto.response.StrategiesResponse;
import com.autric.upbit.domain.strategy.dto.response.StrategyDetailResponse;
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

    /**
     * 전략 전체 조회(전략 선택 페이지)
     * 선택 가능한 전략은 최대 6개이므로 페이징 없이 모두 반환
     */
    public List<StrategiesResponse> getStrategies(){
        return strategyRepository.findAllWithIndicators().stream()
                .map(StrategiesResponse::fromEntity)
                .toList();
    }

    /**
     * 전략 상세 조회(상세보기 모달)
     */
    public StrategyDetailResponse getStrategyDetail(Long id){
        Strategy strategy = strategyRepository.findOneWithIndicators(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.STRATEGY_NOT_FOUND));
        return StrategyDetailResponse.fromEntity(strategy);
    }
}
