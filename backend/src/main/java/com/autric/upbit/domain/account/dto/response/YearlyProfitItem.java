package com.autric.upbit.domain.account.dto.response;

import com.autric.upbit.domain.account.entity.AccountHistory;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

/**
 * 연도별 투자손익 상세
 */
@Getter
@Builder
public class YearlyProfitItem {
    
    private int year;
    private Long yearlyProfitLoss;
    private BigDecimal yearlyProfitRate;
    private Long cumulativeProfitLoss;
    private BigDecimal cumulativeProfitRate;
    private Long startingAsset;
    private Long endingAsset;
    private Long deposit;
    private Long withdrawal;
    private int tradingDays;

    /**
     * 연간 데이터 리스트로부터 연도별 아이템 생성
     */
    public static YearlyProfitItem fromEntities(int year, List<AccountHistory> yearData,
                                                 Long cumulativePL, Long initialTotalAsset) {
        AccountHistory first = yearData.get(0);
        AccountHistory last = yearData.get(yearData.size() - 1);

        long yearlyPL = yearData.stream()
                .mapToLong(AccountHistory::getDailyProfitLoss)
                .sum();

        long yearDeposit = yearData.stream()
                .mapToLong(AccountHistory::getDeposit)
                .sum();

        long yearWithdraw = yearData.stream()
                .mapToLong(AccountHistory::getWithdrawal)
                .sum();

        BigDecimal yearlyRate = BigDecimal.ZERO;
        if (first.getTotalAsset() > 0) {
            yearlyRate = BigDecimal.valueOf(yearlyPL)
                    .multiply(BigDecimal.valueOf(100))
                    .divide(BigDecimal.valueOf(first.getTotalAsset()), 4, RoundingMode.HALF_UP);
        }

        BigDecimal cumulativeRate = BigDecimal.ZERO;
        if (initialTotalAsset > 0) {
            cumulativeRate = BigDecimal.valueOf(cumulativePL)
                    .multiply(BigDecimal.valueOf(100))
                    .divide(BigDecimal.valueOf(initialTotalAsset), 4, RoundingMode.HALF_UP);
        }

        return YearlyProfitItem.builder()
                .year(year)
                .yearlyProfitLoss(yearlyPL)
                .yearlyProfitRate(yearlyRate)
                .cumulativeProfitLoss(cumulativePL)
                .cumulativeProfitRate(cumulativeRate)
                .startingAsset(first.getTotalAsset())
                .endingAsset(last.getTotalAsset())
                .deposit(yearDeposit)
                .withdrawal(yearWithdraw)
                .tradingDays(yearData.size())
                .build();
    }
}
