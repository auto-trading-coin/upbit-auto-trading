package com.autric.upbit.domain.signal.service;

import com.autric.upbit.domain.chart.entity.Market;
import com.autric.upbit.domain.order.entity.Orders;
import com.autric.upbit.domain.order.repository.OrderRepository;
import com.autric.upbit.domain.signal.dto.response.SignalListResponse;
import com.autric.upbit.domain.signal.dto.response.SignalResponse;
import com.autric.upbit.domain.signal.entity.Signals;
import com.autric.upbit.domain.signal.repository.SignalRepository;
import com.autric.upbit.domain.strategy.entity.Strategy;
import com.autric.upbit.external.kafka.dto.SignalMessage;
import com.autric.upbit.global.response.code.ErrorCode;
import com.autric.upbit.global.response.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class SignalService {

    private final SignalRepository signalRepository;
    private final OrderRepository orderRepository;

    public Signals getSignal(Long id) {
        return signalRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.SIGNAL_NOT_FOUND));
    }

    @Transactional
    public Signals createSignal(SignalMessage msg, Market market, Strategy strategy) {
        return signalRepository.save(msg.toSignalEntity(market, strategy));
    }

    /**
     * 시그널 목록 조회 (ID 리스트)
     */
    @Transactional(readOnly = true)
    public List<SignalResponse> getSignalsByIds(List<Long> signalIds) {
        List<Signals> signals = signalRepository.findByIdInWithDetails(signalIds);

        return signals.stream()
                .map(signal -> {
                    SignalResponse response = SignalResponse.fromEntity(signal);
                    // 관련 주문 ID 찾기
                    List<Orders> orders = orderRepository.findBySignalId(signal.getId());
                    if (!orders.isEmpty()) {
                        response.setRelatedOrderId(orders.get(0).getId());
                    }
                    return response;
                })
                .toList();
    }

    /**
     * 모든 시그널 목록 조회 (페이징)
     */
    @Transactional(readOnly = true)
    public SignalListResponse getSignalsByMember(Long memberId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Signals> signalPage = signalRepository.findSignalsByMember(pageable);

        return SignalListResponse.fromEntity(signalPage);
    }

    /**
     * 모든 시그널 목록 조회 with 필터링 (마켓, 날짜 범위, 전략)
     */
    @Transactional(readOnly = true)
    public SignalListResponse getSignalsByMemberWithFilters(
            Long memberId, int page, int size,
            String market, LocalDate startDate, LocalDate endDate, Long strategyId) {

        // LocalDate를 LocalDateTime으로 변환
        LocalDateTime startDateTime = startDate != null ? startDate.atStartOfDay() : null;
        LocalDateTime endDateTime = endDate != null ? endDate.plusDays(1).atStartOfDay() : null;

        Pageable pageable = PageRequest.of(page, size);
        Page<Signals> signalPage = signalRepository.findSignalsWithFilters(
                market, startDateTime, endDateTime, strategyId, pageable);

        return SignalListResponse.fromEntity(signalPage);
    }
}
