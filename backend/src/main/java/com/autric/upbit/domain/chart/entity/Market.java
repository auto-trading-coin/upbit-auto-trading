package com.autric.upbit.domain.chart.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@ToString
public class Market {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "market_id")
    private Long id;

    /** ex) KRW-BTC */
    @Column(length = 50)
    private String coin;

    @Builder
    public Market(String coin) {
        this.coin = coin;
    }
}
