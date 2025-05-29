package com.autric.upbit.domain.strategy.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@ToString
public class Strategy {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "strategy_id")
    private Integer id;

    @Column(length = 50)
    private String name;

    private String information;

    private String condition;

    @Enumerated(EnumType.STRING)
    private StrategyType strategyType;
}
