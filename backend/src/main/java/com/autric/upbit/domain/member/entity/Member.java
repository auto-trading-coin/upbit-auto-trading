package com.autric.upbit.domain.member.entity;

import com.autric.upbit.domain.strategy.entity.Strategy;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@ToString
public class Member {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "member_id")
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "strategy_id")
    private Strategy strategy;

    @Column(length = 50)
    private String email;

    @Column(length = 20)
    private String nickname;

    @Column(length = 20)
    private String provider;

    @Column(name = "provider_id", length = 50)
    private String providerId;

    @Column(name = "trade_active")
    private Boolean tradeActive;

    @Column(name = "access_key")
    private String accessKey;

    @Column(name = "secret_key")
    private String secretKey;

    @Builder
    public Member(Strategy strategy, String email, String nickname, String provider, String providerId, Boolean tradeActive, String accessKey, String secretKey) {
        this.strategy = strategy;
        this.email = email;
        this.nickname = nickname;
        this.provider = provider;
        this.providerId = providerId;
        this.tradeActive = tradeActive;
        this.accessKey = accessKey;
        this.secretKey = secretKey;
    }
}
