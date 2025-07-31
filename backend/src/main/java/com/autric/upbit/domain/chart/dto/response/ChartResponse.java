package com.autric.upbit.domain.chart.dto.response;

import com.autric.upbit.domain.chart.entity.ChartBase;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChartResponse {

    @JsonProperty("id")
    private Long id;

    @JsonProperty("market")
    private String market;

    @JsonProperty("candle_date_time_kst")
    private LocalDateTime candleDateTimeKst;

    @JsonProperty("opening_price")
    private BigDecimal openingPrice;

    @JsonProperty("high_price")
    private BigDecimal highPrice;

    @JsonProperty("low_price")
    private BigDecimal lowPrice;

    @JsonProperty("trade_price")
    private BigDecimal tradePrice;

    @JsonProperty("timestamp")
    private Long timestamp;

    @JsonProperty("candle_acc_trade_price")
    private BigDecimal candleAccTradePrice;

    @JsonProperty("candle_acc_trade_volume")
    private BigDecimal candleAccTradeVolume;

    @JsonProperty("unit")
    private Integer unit;

    public static ChartResponse fromEntity(ChartBase base, int unit) {
        return ChartResponse.builder()
                .id(base.getId())
                .market(base.getMarket().getCoin())
                .candleDateTimeKst(base.getCandleDateTimeKst())
                .openingPrice(base.getOpeningPrice())
                .highPrice(base.getHighPrice())
                .lowPrice(base.getLowPrice())
                .tradePrice(base.getTradePrice())
                .timestamp(base.getTimestamp())
                .candleAccTradePrice(base.getCandleAccTradePrice())
                .candleAccTradeVolume(base.getCandleAccTradeVolume())
                .unit(unit)
                .build();
    }
}
