package com.autric.upbit.domain.account.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.util.Collections;
import java.util.List;

/**
 * 일별 투자손익 API 응답
 */
@Getter
@Builder
public class DailyProfitResponse {
    
    private InvestmentProfitSummary summary;
    private List<DailyProfitItem> items;

    /**
     * 빈 응답 생성
     */
    public static DailyProfitResponse empty() {
        return DailyProfitResponse.builder()
                .summary(InvestmentProfitSummary.empty())
                .items(Collections.emptyList())
                .build();
    }

    /**
     * 응답 생성
     */
    public static DailyProfitResponse of(InvestmentProfitSummary summary, List<DailyProfitItem> items) {
        return DailyProfitResponse.builder()
                .summary(summary)
                .items(items)
                .build();
    }
}
