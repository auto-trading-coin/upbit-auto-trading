package com.autric.upbit.external.upbit.dto.response;

import com.autric.upbit.domain.chart.entity.*;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * Upbit 분봉 Response DTO
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpbitCandleResponse {

    @JsonProperty("market")
    private String market;

    @JsonProperty("candle_date_time_kst")
    private String candleDateTimeKst;

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

    /** dto → 엔티티 변환 */
    public Chart1m toChart1mEntity(Market market, Integer unit) {
        return Chart1m.builder()
                .market(market)
                .candleDateTimeKst(parseCandleDateTimeKst())
                .openingPrice(openingPrice)
                .highPrice(highPrice)
                .lowPrice(lowPrice)
                .tradePrice(tradePrice)
                .candleAccTradePrice(candleAccTradePrice)
                .candleAccTradeVolume(candleAccTradeVolume)
                .timestamp(timestamp)
                .unit(unit)
                .build();
    }

    public Chart5m toChart5mEntity(Market market, Integer unit) {
        return Chart5m.builder()
                .market(market)
                .candleDateTimeKst(parseCandleDateTimeKst())
                .openingPrice(openingPrice)
                .highPrice(highPrice)
                .lowPrice(lowPrice)
                .tradePrice(tradePrice)
                .candleAccTradePrice(candleAccTradePrice)
                .candleAccTradeVolume(candleAccTradeVolume)
                .timestamp(timestamp)
                .unit(unit)
                .build();
    }

    public Chart30m toChart30mEntity(Market market, Integer unit) {
        return Chart30m.builder()
                .market(market)
                .candleDateTimeKst(parseCandleDateTimeKst())
                .openingPrice(openingPrice)
                .highPrice(highPrice)
                .lowPrice(lowPrice)
                .tradePrice(tradePrice)
                .candleAccTradePrice(candleAccTradePrice)
                .candleAccTradeVolume(candleAccTradeVolume)
                .timestamp(timestamp)
                .unit(unit)
                .build();
    }

    public Chart60m toChart60mEntity(Market market, Integer unit) {
        return Chart60m.builder()
                .market(market)
                .candleDateTimeKst(parseCandleDateTimeKst())
                .openingPrice(openingPrice)
                .highPrice(highPrice)
                .lowPrice(lowPrice)
                .tradePrice(tradePrice)
                .candleAccTradePrice(candleAccTradePrice)
                .candleAccTradeVolume(candleAccTradeVolume)
                .timestamp(timestamp)
                .unit(unit)
                .build();
    }

    public Chart240m toChart240mEntity(Market market, Integer unit) {
        return Chart240m.builder()
                .market(market)
                .candleDateTimeKst(parseCandleDateTimeKst())
                .openingPrice(openingPrice)
                .highPrice(highPrice)
                .lowPrice(lowPrice)
                .tradePrice(tradePrice)
                .candleAccTradePrice(candleAccTradePrice)
                .candleAccTradeVolume(candleAccTradeVolume)
                .timestamp(timestamp)
                .unit(unit)
                .build();
    }

    public Chart1d toChart1dEntity(Market market, Integer unit) {
        return Chart1d.builder()
                .market(market)
                .candleDateTimeKst(parseCandleDateTimeKst())
                .openingPrice(openingPrice)
                .highPrice(highPrice)
                .lowPrice(lowPrice)
                .tradePrice(tradePrice)
                .timestamp(timestamp)
                .candleAccTradePrice(candleAccTradePrice)
                .candleAccTradeVolume(candleAccTradeVolume)
                .unit(unit)
                .build();
    }

    private LocalDateTime parseCandleDateTimeKst() {
        return LocalDateTime.parse(candleDateTimeKst, DateTimeFormatter.ISO_DATE_TIME);
    }

    // UpbitMinuteCandleResponse.java
    public LocalDateTime getParsedDateTime() {
        return LocalDateTime.parse(this.candleDateTimeKst);
    }

}
