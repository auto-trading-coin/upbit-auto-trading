package com.autric.upbit.domain.signal.service;

import com.autric.upbit.domain.chart.entity.Market;
import com.autric.upbit.domain.signal.entity.Signals;
import com.autric.upbit.domain.signal.repository.SignalRepository;
import com.autric.upbit.domain.strategy.entity.Strategy;
import com.autric.upbit.external.kafka.dto.SignalMessage;
import com.autric.upbit.global.response.code.ErrorCode;
import com.autric.upbit.global.response.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Slf4j
@RequiredArgsConstructor
public class SignalService {

    private final SignalRepository signalRepository;

    public Signals getSignal(Long id){
        return signalRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.SIGNAL_NOT_FOUND));
    }

    @Transactional
    public Signals createSignal(SignalMessage msg, Market market, Strategy strategy) {
        return signalRepository.save(msg.toSignalEntity(market, strategy));
    }
}
