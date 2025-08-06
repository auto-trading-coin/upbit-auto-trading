package com.autric.upbit.domain.strategy.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * 전략 - 지표 중간 테이블 Entity
 * (하나의 전략은 여러 지표를, 하나의 지표는 여러 전략에 사용 가능)
 */
@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "strategy_indicator")
@ToString
public class StrategyIndicator {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "strategy_indicator_id")
    private Long id;

    /** 연관된 전략 */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "strategy_id")
    private Strategy strategy;

    /** 연관된 지표 */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "indicator_id")
    private Indicator indicator;

    public StrategyIndicator(Strategy strategy, Indicator indicator) {
        this.strategy = strategy;
        this.indicator = indicator;
    }
}
