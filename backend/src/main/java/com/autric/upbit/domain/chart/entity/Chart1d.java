package com.autric.upbit.domain.chart.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "chart_1d")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@ToString
public class Chart1d {

    /**
     * 차트 1일봉 PK
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "chart_1d_id")
    private Long id;

    /**
     * 마켓ID FK
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "market_id")
    private Market market;  // ex: KRW-BTC

    /**
     * 캔들 기준 시각(KST기준)
     */
    @Column(name = "candle_date_time_kst")
    private LocalDateTime candleDateTimeKst;

    /**
     * 시가
     */
    @Column(name = "opening_price", precision = 24, scale = 12)
    private BigDecimal openingPrice;

    /**
     * 고가
     */
    @Column(name = "high_price", precision = 24, scale = 12)
    private BigDecimal highPrice;

    /**
     * 저가
     */
    @Column(name = "low_price", precision = 24, scale = 12)
    private BigDecimal lowPrice;

    /**
     * 종가
     */
    @Column(name = "trade_price", precision = 24, scale = 12)
    private BigDecimal tradePrice;

    /**
     * 해당 캔들에서 마지막 틱이 저장된 시각
     */
    private LocalDateTime timestamp; // 해당 캔들의 마지막 틱 저장 시각

    /**
     * 누적 거래량
     */
    @Column(name = "candle_acc_trade_price", precision = 24, scale = 12)
    private BigDecimal candleAccTradePrice;

    /**
     * 누적 거래량
     */
    @Column(name = "candle_acc_trade_volume", precision = 24, scale = 12)
    private BigDecimal candleAccTradeVolume;

    /**
     * 봉 단위
     */
    private Integer unit;  // ex: 1 (1분), 5 (5분) 등

    @Builder
    public Chart1d(Market market, LocalDateTime candleDateTimeKst, BigDecimal openingPrice,
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
