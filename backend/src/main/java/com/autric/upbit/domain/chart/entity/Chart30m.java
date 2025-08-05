package com.autric.upbit.domain.chart.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "chart_30m",
        indexes = {
                @Index(name = "idx_market_unit_time_desc", columnList = "market_id, candle_date_time_kst DESC"),
                @Index(name = "idx_market_unit_candle_time", columnList = "market_id,unit,candle_date_time_kst")
        },
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_market_unit_candle_time", columnNames = {"market_id", "unit", "candle_date_time_kst"})
        }
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@ToString
public class Chart30m extends ChartBase{

    @Builder
    public Chart30m(Market market, LocalDateTime candleDateTimeKst, BigDecimal openingPrice,
                   BigDecimal highPrice, BigDecimal lowPrice, BigDecimal tradePrice,
                   Long timestamp, BigDecimal candleAccTradePrice,
                   BigDecimal candleAccTradeVolume, Integer unit) {
        super(market, candleDateTimeKst, openingPrice, highPrice, lowPrice, tradePrice,
                timestamp, candleAccTradePrice, candleAccTradeVolume, unit);
    }
}
