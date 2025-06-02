package com.autric.upbit.domain.account.entity;

import com.autric.upbit.domain.member.entity.Member;
import com.autric.upbit.global.entity.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 계좌 내역 Entity
 */
@Entity
@Table(name = "account_history")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@ToString
public class AccountHistory extends BaseTimeEntity {

    /**
     * 계좌ID PK
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "account_history")
    private Long id;

    /**
     * 멤버ID FK
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "strategy_id")
    private Member member;

    /**
     * 총 자산
     */
    @Column(name = "total_assets")
    private Long totalAssets;

    /**
     * 원화 보유액
     */
    @Column(name = "krw_balance")
    private Long krwBalance;

    /**
     * 코인 평가액
     */
    @Column(name = "coin_value")
    private Long coinValue;

    /**
     * 변동률%
     */
    @Column(name = "rate_change", precision = 5, scale = 2)
    private BigDecimal rateChange;

    /**
     * 스냅샷 종류 ENUM('DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY')
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "source_type")
    private SourceType source;

    @Builder
    public AccountHistory(Member member, Long totalAssets, Long krwBalance, Long coinValue,
                          BigDecimal rateChange, LocalDateTime createdAt, SourceType source) {
        this.member = member;
        this.totalAssets = totalAssets;
        this.krwBalance = krwBalance;
        this.coinValue = coinValue;
        this.rateChange = rateChange;
        this.source = source;
    }

}