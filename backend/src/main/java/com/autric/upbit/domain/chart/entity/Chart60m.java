package com.autric.upbit.domain.chart.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "chart_60m")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@ToString
public class Chart60m {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "chart_60m_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "market_id")
    private Market market;  // ex: KRW-BTC

    @Column(name = "candle_date_time_kst", nullable = false)
    private LocalDateTime candleDateTimeKst;

    @Column(name = "opening_price", precision = 24, scale = 12)
    private BigDecimal openingPrice;

    @Column(name = "high_price", precision = 24, scale = 12)
    private BigDecimal highPrice;

    @Column(name = "low_price", precision = 24, scale = 12)
    private BigDecimal lowPrice;

    @Column(name = "trade_price", precision = 24, scale = 12)
    private BigDecimal tradePrice;

    @Column(nullable = false)
    private LocalDateTime timestamp; // 해당 캔들의 마지막 틱 저장 시각

    @Column(name = "candle_acc_trade_price", precision = 24, scale = 12)
    private BigDecimal candleAccTradePrice;

    @Column(name = "candle_acc_trade_volume", precision = 24, scale = 12)
    private BigDecimal candleAccTradeVolume;

    @Column(nullable = false)
    private Integer unit;  // ex: 1 (1분), 5 (5분) 등

    @Builder
    public Chart60m(Market market, LocalDateTime candleDateTimeKst, BigDecimal openingPrice,
                   BigDecimal highPrice, BigDecimal lowPrice, BigDecimal tradePrice,
                   LocalDateTime timestamp, BigDecimal candleAccTradePrice,
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
