package com.autric.upbit.domain.account.dto.response;

import com.autric.upbit.domain.account.entity.AccountHistory;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

/**
 * 월별 투자손익 상세
 */
@Getter
@Builder
public class MonthlyProfitItem {
    
    private int year;
    private int month;
    private Long monthlyProfitLoss;
    private BigDecimal monthlyProfitRate;
    private Long cumulativeProfitLoss;
    private BigDecimal cumulativeProfitRate;
    private Long startingAsset;
    private Long endingAsset;
    private Long deposit;
    private Long withdrawal;
    private int tradingDays;

    /**
     * 월간 데이터 리스트로부터 월별 아이템 생성
     */
    public static MonthlyProfitItem fromEntities(int year, int month, List<AccountHistory> monthData,
                                                  Long cumulativePL, Long initialTotalAsset) {
        AccountHistory first = monthData.get(0);
        AccountHistory last = monthData.get(monthData.size() - 1);

        long monthlyPL = monthData.stream()
                .mapToLong(AccountHistory::getDailyProfitLoss)
                .sum();

        long monthDeposit = monthData.stream()
                .mapToLong(AccountHistory::getDeposit)
                .sum();

        long monthWithdraw = monthData.stream()
                .mapToLong(AccountHistory::getWithdrawal)
                .sum();

        BigDecimal monthlyRate = BigDecimal.ZERO;
        if (first.getTotalAsset() > 0) {
            monthlyRate = BigDecimal.valueOf(monthlyPL)
                    .multiply(BigDecimal.valueOf(100))
                    .divide(BigDecimal.valueOf(first.getTotalAsset()), 4, RoundingMode.HALF_UP);
        }

        BigDecimal cumulativeRate = BigDecimal.ZERO;
        if (initialTotalAsset > 0) {
            cumulativeRate = BigDecimal.valueOf(cumulativePL)
                    .multiply(BigDecimal.valueOf(100))
                    .divide(BigDecimal.valueOf(initialTotalAsset), 4, RoundingMode.HALF_UP);
        }

        return MonthlyProfitItem.builder()
                .year(year)
                .month(month)
                .monthlyProfitLoss(monthlyPL)
                .monthlyProfitRate(monthlyRate)
                .cumulativeProfitLoss(cumulativePL)
                .cumulativeProfitRate(cumulativeRate)
                .startingAsset(first.getTotalAsset())
                .endingAsset(last.getTotalAsset())
                .deposit(monthDeposit)
                .withdrawal(monthWithdraw)
                .tradingDays(monthData.size())
                .build();
    }
}
