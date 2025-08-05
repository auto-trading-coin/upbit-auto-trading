package com.autric.upbit.domain.chart.entity;

import jakarta.persistence.*;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@MappedSuperclass
@Getter
public abstract class ChartBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "market_id", nullable = false)
    private Market market;

    @Column(name = "candle_date_time_kst", nullable = false)
    private LocalDateTime candleDateTimeKst;

    @Column(name = "opening_price", precision = 24, scale = 12, nullable = false)
    private BigDecimal openingPrice;

    @Column(name = "high_price", precision = 24, scale = 12, nullable = false)
    private BigDecimal highPrice;

    @Column(name = "low_price", precision = 24, scale = 12, nullable = false)
    private BigDecimal lowPrice;

    @Column(name = "trade_price", precision = 24, scale = 12, nullable = false)
    private BigDecimal tradePrice;

    @Column(name = "timestamp", nullable = false)
    private Long timestamp;

    @Column(name = "candle_acc_trade_price", precision = 35, scale = 12, nullable = false)
    private BigDecimal candleAccTradePrice;

    @Column(name = "candle_acc_trade_volume", precision = 35, scale = 12, nullable = false)
    private BigDecimal candleAccTradeVolume;

    @Column(name = "unit", nullable = false)
    private Integer unit;

    protected ChartBase() {}

    protected ChartBase(Market market, LocalDateTime candleDateTimeKst, BigDecimal openingPrice,
                        BigDecimal highPrice, BigDecimal lowPrice, BigDecimal tradePrice,
                        Long timestamp, BigDecimal candleAccTradePrice, BigDecimal candleAccTradeVolume,
                        Integer unit) {
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
