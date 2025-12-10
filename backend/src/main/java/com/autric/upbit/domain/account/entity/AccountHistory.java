package com.autric.upbit.domain.account.entity;

import com.autric.upbit.domain.member.entity.Member;
import com.autric.upbit.global.entity.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * 일별 자산 스냅샷 Entity
 * 매일 08:50에 각 사용자의 자산 상태를 저장
 */
@Entity
@Table(name = "account_history", 
       uniqueConstraints = @UniqueConstraint(columnNames = {"member_id", "snapshot_date"}))
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@ToString
public class AccountHistory extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "account_history_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    /** 스냅샷 날짜 (YYYY-MM-DD) */
    @Column(name = "snapshot_date", nullable = false)
    private LocalDate snapshotDate;

    /** 총 자산 (원화 + 코인 평가액) */
    @Column(name = "total_asset", nullable = false)
    private Long totalAsset;

    /** 원화 잔고 */
    @Column(name = "krw_balance", nullable = false)
    private Long krwBalance;

    /** 코인 평가액 */
    @Column(name = "coin_value", nullable = false)
    private Long coinValue;

    /** 당일 입금액 */
    @Column(name = "deposit", nullable = false)
    private Long deposit;

    /** 당일 출금액 */
    @Column(name = "withdrawal", nullable = false)
    private Long withdrawal;

    /** 일일 손익 = (오늘 총자산 - 어제 총자산) - (입금 - 출금) */
    @Column(name = "daily_profit_loss", nullable = false)
    private Long dailyProfitLoss;

    /** 일일 수익률 (%) */
    @Column(name = "daily_profit_rate", precision = 10, scale = 4, nullable = false)
    private BigDecimal dailyProfitRate;

    @Builder
    public AccountHistory(Member member, LocalDate snapshotDate, Long totalAsset, 
                          Long krwBalance, Long coinValue, Long deposit, Long withdrawal,
                          Long dailyProfitLoss, BigDecimal dailyProfitRate) {
        this.member = member;
        this.snapshotDate = snapshotDate;
        this.totalAsset = totalAsset;
        this.krwBalance = krwBalance;
        this.coinValue = coinValue;
        this.deposit = deposit;
        this.withdrawal = withdrawal;
        this.dailyProfitLoss = dailyProfitLoss;
        this.dailyProfitRate = dailyProfitRate;
    }
}
