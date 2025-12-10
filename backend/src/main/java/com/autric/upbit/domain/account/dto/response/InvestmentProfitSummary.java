package com.autric.upbit.domain.account.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

/**
 * 투자손익 요약 정보
 */
@Getter
@Builder
public class InvestmentProfitSummary {
    
    private String periodStart;
    private String periodEnd;
    private Long totalProfitLoss;
    private BigDecimal totalProfitRate;
    private Long averageInvestment;

    /**
     * 빈 요약 정보 생성
     */
    public static InvestmentProfitSummary empty() {
        return InvestmentProfitSummary.builder()
                .periodStart("")
                .periodEnd("")
                .totalProfitLoss(0L)
                .totalProfitRate(BigDecimal.ZERO)
                .averageInvestment(0L)
                .build();
    }

    /**
     * 요약 정보 생성
     */
    public static InvestmentProfitSummary of(String periodStart, String periodEnd,
                                              Long totalProfitLoss, BigDecimal totalProfitRate,
                                              Long averageInvestment) {
        return InvestmentProfitSummary.builder()
                .periodStart(periodStart)
                .periodEnd(periodEnd)
                .totalProfitLoss(totalProfitLoss)
                .totalProfitRate(totalProfitRate)
                .averageInvestment(averageInvestment)
                .build();
    }
}
