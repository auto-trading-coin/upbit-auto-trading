package com.autric.upbit.external.kafka.dto;

import com.autric.upbit.domain.chart.entity.Market;
import com.autric.upbit.domain.order.entity.Side;
import com.autric.upbit.domain.signal.entity.Signals;
import com.autric.upbit.domain.strategy.entity.Strategy;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SignalMessage {
    /** 마켓 이름 (ex. KRW-BTC)*/
    private String market;

    /** 전략 ID (ex. 1)*/
    private Long strategy;

    /** 시장가 매수/매도 옵션 (bid : 매수 / ask : 매도)*/
    private String side;

    @JsonFormat(shape = JsonFormat.Shape.STRING)
    private Instant timestamp;

    /** msg 를 Signal로 저장하기 위한 엔티티 변환*/
    public Signals toSignalEntity(Market market, Strategy strategy){
        return Signals.builder()
                .strategy(strategy)
                .market(market)
                .side(Side.fromValue(this.side))
                .build();
    }
}
