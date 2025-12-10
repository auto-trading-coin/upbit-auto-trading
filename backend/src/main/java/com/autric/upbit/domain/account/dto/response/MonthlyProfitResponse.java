package com.autric.upbit.domain.account.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.util.Collections;
import java.util.List;

/**
 * 월별 투자손익 API 응답
 */
@Getter
@Builder
public class MonthlyProfitResponse {
    
    private InvestmentProfitSummary summary;
    private List<MonthlyProfitItem> items;

    /**
     * 빈 응답 생성
     */
    public static MonthlyProfitResponse empty() {
        return MonthlyProfitResponse.builder()
                .summary(InvestmentProfitSummary.empty())
                .items(Collections.emptyList())
                .build();
    }

    /**
     * 응답 생성
     */
    public static MonthlyProfitResponse of(InvestmentProfitSummary summary, List<MonthlyProfitItem> items) {
        return MonthlyProfitResponse.builder()
                .summary(summary)
                .items(items)
                .build();
    }
}
