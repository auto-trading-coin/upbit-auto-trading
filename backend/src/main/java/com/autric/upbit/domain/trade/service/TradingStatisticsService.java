package com.autric.upbit.domain.trade.service;

import com.autric.upbit.domain.chart.entity.Market;
import com.autric.upbit.domain.member.entity.Member;
import com.autric.upbit.domain.order.entity.Orders;
import com.autric.upbit.domain.order.entity.Side;
import com.autric.upbit.domain.order.repository.OrderRepository;
import com.autric.upbit.domain.trade.entity.TradingStatistics;
import com.autric.upbit.domain.trade.repository.TradingStatisticsRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * 거래 통계 서비스
 * 
 * 매도 체결 시 호출되어 건당 통계를 업데이트합니다.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class TradingStatisticsService {

    private final TradingStatisticsRepository tradingStatisticsRepository;
    private final OrderRepository orderRepository;

    /**
     * 매도 체결 시 통계 업데이트
     * 
     * [처리 흐름]
     * 1. 매칭할 매수 주문 조회 (같은 member, market, BID, 매도보다 이전)
     * 2. 손익률 계산: (매도가 - 매수가) / 매수가 × 100
     * 3. TradingStatistics 업데이트 (없으면 생성)
     * 
     * @param member 회원
     * @param market 마켓
     * @param sellOrder 매도 주문
     */
    @Transactional
    public void updateOnSell(Member member, Market market, Orders sellOrder) {
        // 1. 매칭할 매수 주문 조회
        Orders buyOrder = orderRepository
                .findTopByMemberAndMarketAndSideAndCreatedAtBeforeOrderByCreatedAtDesc(
                        member, market, Side.BID, sellOrder.getCreatedAt())
                .orElse(null);

        if (buyOrder == null) {
            log.warn("매칭할 매수 주문 없음: member={}, market={}", member.getId(), market.getCoin());
            return;
        }

        // 2. 수익률 계산
        BigDecimal profitRate = calculateProfitRate(buyOrder.getPrice(), sellOrder.getPrice());

        log.info("거래 완료: member={}, market={}, buyPrice={}, sellPrice={}, profitRate={}%",
                member.getId(), market.getCoin(), buyOrder.getPrice(), sellOrder.getPrice(), profitRate);

        // 3. 통계 업데이트
        TradingStatistics stats = tradingStatisticsRepository.findByMember(member)
                .orElseGet(() -> TradingStatistics.createEmpty(member));

        stats.updateOnTradeComplete(profitRate);
        tradingStatisticsRepository.save(stats);
    }

    /**
     * 수익률 계산
     * 
     * 공식: (매도가 - 매수가) / 매수가 × 100
     * 
     * @param buyPrice 매수가
     * @param sellPrice 매도가
     * @return 수익률 (%)
     */
    private BigDecimal calculateProfitRate(BigDecimal buyPrice, BigDecimal sellPrice) {
        if (buyPrice == null || sellPrice == null || buyPrice.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }

        return sellPrice.subtract(buyPrice)
                .divide(buyPrice, 6, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100))
                .setScale(4, RoundingMode.HALF_UP);
    }

    /**
     * 회원의 거래 통계 조회
     */
    @Transactional(readOnly = true)
    public TradingStatistics getStatistics(Member member) {
        return tradingStatisticsRepository.findByMember(member)
                .orElse(TradingStatistics.createEmpty(member));
    }
}
