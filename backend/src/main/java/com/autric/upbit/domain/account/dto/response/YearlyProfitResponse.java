package com.autric.upbit.domain.account.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.util.Collections;
import java.util.List;

/**
 * 연도별 투자손익 API 응답
 */
@Getter
@Builder
public class YearlyProfitResponse {
    
    private InvestmentProfitSummary summary;
    private List<YearlyProfitItem> items;

    /**
     * 빈 응답 생성
     */
    public static YearlyProfitResponse empty() {
        return YearlyProfitResponse.builder()
                .summary(InvestmentProfitSummary.empty())
                .items(Collections.emptyList())
                .build();
    }

    /**
     * 응답 생성
     */
    public static YearlyProfitResponse of(InvestmentProfitSummary summary, List<YearlyProfitItem> items) {
        return YearlyProfitResponse.builder()
                .summary(summary)
                .items(items)
                .build();
    }
}
