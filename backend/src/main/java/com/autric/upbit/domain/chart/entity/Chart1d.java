package com.autric.upbit.domain.chart.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "chart_1d",
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
public class Chart1d {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "chart_1d_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "market_id")
    private Market market;

    @Column(name = "candle_date_time_kst")
    private LocalDateTime candleDateTimeKst;

    @Column(name = "opening_price", precision = 24, scale = 12)
    private BigDecimal openingPrice;

    @Column(name = "high_price", precision = 24, scale = 12)
    private BigDecimal highPrice;

    @Column(name = "low_price", precision = 24, scale = 12)
    private BigDecimal lowPrice;

    @Column(name = "trade_price", precision = 24, scale = 12)
    private BigDecimal tradePrice;

    /**
     * 해당 캔들의 마지막 틱 저장 시각 (UTC 기준 epoch millis)
     */
    @Column(name = "timestamp")
    private Long timestamp;

    @Column(name = "candle_acc_trade_price", precision = 35, scale = 12)
    private BigDecimal candleAccTradePrice;

    @Column(name = "candle_acc_trade_volume", precision = 35, scale = 12)
    private BigDecimal candleAccTradeVolume;

    private Integer unit;

    @Builder
    public Chart1d(Market market, LocalDateTime candleDateTimeKst, BigDecimal openingPrice,
                   BigDecimal highPrice, BigDecimal lowPrice, BigDecimal tradePrice,
                   Long timestamp, BigDecimal candleAccTradePrice,
                   BigDecimal candleAccTradeVolume, Integer unit) {
        this.market = market;
        this.candleDateTimeKst = candleDateTimeKst;
        this.openingPrice = openingPrice;
        this.highPrice = highPrice;
        this.lowPrice = lowPrice;
        this.tradePrice = tradePrice;
        this.timestamp = timestamp;
        this.candleAccTradePrice = candleAccTradePrice;
        this.candleAccTradeVolume = candleAccTradeVolume;
        this.unit = unit;
    }
}
