package com.autric.upbit.domain.account.dto.response;

import com.autric.upbit.domain.trade.entity.TradingStatistics;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

/**
 * 자동매매 성과 지표 (전체 기간)
 * 
 * 지표별 기준:
 * - 일별 기준: MDD, 총 수익률 (AccountHistory 스냅샷 기반)
 * - 건당 기준: 최대 수익률, 최대 손실률, 승률, 수익거래, 손실거래 (TradingStatistics 기반)
 */
@Getter
@Builder
public class TradingMetricsResponse {
    
    // === 일별 기준 지표 (AccountHistory) ===
    
    /** 총 수익률 (%) - 일별 */
    private BigDecimal totalProfitRate;
    
    /** MDD 최대낙폭 (%) - 일별 */
    private BigDecimal maxDrawdown;
    
    /** MDD 발생일 */
    private String maxDrawdownDate;
    
    // === 건당 기준 지표 (TradingStatistics) ===
    
    /** 최대 수익률 (%) - 건당 */
    private BigDecimal maxProfitRate;
    
    /** 최대 손실률 (%) - 건당 */
    private BigDecimal maxLossRate;
    
    /** 총 거래 수 - 건당 */
    private int totalTrades;
    
    /** 수익 거래 수 - 건당 */
    private int winningTrades;
    
    /** 손실 거래 수 - 건당 */
    private int losingTrades;
    
    /** 승률 (%) - 건당 */
    private BigDecimal winRate;
    
    // === 기간 및 자산 정보 ===
    
    /** 거래 시작일 */
    private String tradingStartDate;
    
    /** 총 거래일수 - 일별 */
    private int tradingDays;
    
    /** 총 투자금액 */
    private Long totalInvested;
    
    /** 현재 자산 */
    private Long currentAsset;
    
    /** 총 손익 금액 */
    private Long totalProfitLoss;

    /**
     * 빈 지표 생성
     */
    public static TradingMetricsResponse empty() {
        return TradingMetricsResponse.builder()
                .totalProfitRate(BigDecimal.ZERO)
                .maxProfitRate(BigDecimal.ZERO)
                .maxDrawdown(BigDecimal.ZERO)
                .maxDrawdownDate("")
                .maxLossRate(BigDecimal.ZERO)
                .totalTrades(0)
                .winningTrades(0)
                .losingTrades(0)
                .winRate(BigDecimal.ZERO)
                .tradingStartDate("")
                .tradingDays(0)
                .totalInvested(0L)
                .currentAsset(0L)
                .totalProfitLoss(0L)
                .build();
    }

    /**
     * TradingStatistics 건당 지표 적용
     */
    public static TradingMetricsResponse withTradeStats(TradingMetricsResponse base, TradingStatistics stats) {
        return TradingMetricsResponse.builder()
                // 일별 지표 유지
                .totalProfitRate(base.getTotalProfitRate())
                .maxDrawdown(base.getMaxDrawdown())
                .maxDrawdownDate(base.getMaxDrawdownDate())
                .tradingStartDate(base.getTradingStartDate())
                .tradingDays(base.getTradingDays())
                .totalInvested(base.getTotalInvested())
                .currentAsset(base.getCurrentAsset())
                .totalProfitLoss(base.getTotalProfitLoss())
                // 건당 지표 덮어쓰기
                .maxProfitRate(stats.getMaxProfitRate())
                .maxLossRate(stats.getMaxLossRate())
                .totalTrades(stats.getTotalTrades())
                .winningTrades(stats.getWinningTrades())
                .losingTrades(stats.getLosingTrades())
                .winRate(stats.getWinRate())
                .build();
    }
}
