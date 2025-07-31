package com.autric.upbit.domain.strategy.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

/**
 * 기술적 지표 Entity (예: RSI, MACD 등)
 */
@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "indicator")
@ToString
public class Indicator {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "indicator_id")
    private Long id;

    /** 지표 이름 */
    @Column(length = 50)
    private String name;

    /** 지표 설명 */
    private String description;

    /** 이 지표가 사용된 전략 목록 */
    @OneToMany(mappedBy = "indicator", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<StrategyIndicator> strategies = new HashSet<>();

    @Builder
    public Indicator(String name, String description) {
        this.name = name;
        this.description = description;
    }
}

