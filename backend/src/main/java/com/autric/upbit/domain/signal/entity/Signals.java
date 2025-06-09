package com.autric.upbit.domain.signal.entity;

import com.autric.upbit.domain.chart.entity.Market;
import com.autric.upbit.domain.strategy.entity.Strategy;
import com.autric.upbit.global.entity.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.*;

/**
 * 매매 신호(StrategySignal) Entity
 */
@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "signals")
@ToString
public class Signals extends BaseTimeEntity {

    /**
     * 신호ID PK
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "signals_id")
    private Long id;

    /**
     * 전략ID FK
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "strategy_id")
    private Strategy strategy;

    /**
     * 마켓ID FK
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "market_id")
    private Market market;

    /**
     * 매매 신호 유형
     * ex) 신규 진입(entry), 청산(exit), 취소(cancel)
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "signal_type")
    private SignalType signalType;

    /**
     * StrategySignal 생성자 (Builder 패턴 사용)
     */
    @Builder
    public Signals(Strategy strategy, Market market, SignalType signalType) {
        this.strategy = strategy;
        this.market = market;
        this.signalType = signalType;
    }

}
