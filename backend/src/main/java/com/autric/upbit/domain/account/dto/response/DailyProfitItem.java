package com.autric.upbit.domain.account.dto.response;

import com.autric.upbit.domain.account.entity.AccountHistory;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

/**
 * 일별 투자손익 상세
 */
@Getter
@Builder
public class DailyProfitItem {
    
    private String date;
    private Long dailyProfitLoss;
    private BigDecimal dailyProfitRate;
    private Long cumulativeProfitLoss;
    private BigDecimal cumulativeProfitRate;
    private Long startingAsset;
    private Long endingAsset;
    private Long deposit;
    private Long withdrawal;

    /**
     * Entity → DTO 변환
     */
    public static DailyProfitItem fromEntity(AccountHistory history, Long prevTotalAsset,
                                              Long cumulativeProfitLoss, BigDecimal cumulativeProfitRate) {
        return DailyProfitItem.builder()
                .date(history.getSnapshotDate().toString())
                .dailyProfitLoss(history.getDailyProfitLoss())
                .dailyProfitRate(history.getDailyProfitRate())
                .cumulativeProfitLoss(cumulativeProfitLoss)
                .cumulativeProfitRate(cumulativeProfitRate)
                .startingAsset(prevTotalAsset)
                .endingAsset(history.getTotalAsset())
                .deposit(history.getDeposit())
                .withdrawal(history.getWithdrawal())
                .build();
    }
}
