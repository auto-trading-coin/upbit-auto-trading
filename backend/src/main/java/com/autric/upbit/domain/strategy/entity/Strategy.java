package com.autric.upbit.domain.strategy.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

/**
 * 전략 Entity
 */
@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "strategy")
@ToString
public class Strategy {

    /**
     * 전략ID PK
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "strategy_id")
    private Long id;

    /**
     * 전략 이름
     */
    @Column(length = 50)
    private String name;

    /**
     * 전략 설명
     */
    private String information;

    /**
     * 전략 조건
     */
    private String conditions;

    /**
     * 전략 유형
     * ex) 추세반전형, 추세추종형, 평균회기형 등
     */
    @Enumerated(EnumType.STRING)
    private StrategyType strategyType;

    /**
     * 전략에 사용되는 지표 목록
     * ex) RSI, EMA, MACD, Bollinger Bands 등
     */
    @OneToMany(mappedBy = "strategy", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<StrategyIndicator> indicators = new HashSet<>();

    @Builder
    public Strategy(String name, String information, String conditions, StrategyType strategyType) {
        this.name = name;
        this.information = information;
        this.conditions = conditions;
        this.strategyType = strategyType;
    }
}
