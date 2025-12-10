package com.autric.upbit.domain.trade.entity;

import com.autric.upbit.domain.member.entity.Member;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;

/**
 * 유저별 거래 통계 (건당 기준)
 * 
 * 매도 체결 시마다 업데이트됨
 */
@Entity
@Table(name = "trading_statistics")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class TradingStatistics {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false, unique = true)
    private Member member;

    /** 총 거래 수 (완료된 매수-매도 사이클) */
    @Builder.Default
    private Integer totalTrades = 0;

    /** 수익 거래 수 */
    @Builder.Default
    private Integer winningTrades = 0;

    /** 손실 거래 수 */
    @Builder.Default
    private Integer losingTrades = 0;

    /** 최대 수익률 (건당, %) */
    @Builder.Default
    private BigDecimal maxProfitRate = BigDecimal.ZERO;

    /** 최대 손실률 (건당, %) */
    @Builder.Default
    private BigDecimal maxLossRate = BigDecimal.ZERO;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;


    /**
     * 신규 회원용 빈 통계 생성
     */
    public static TradingStatistics createEmpty(Member member) {
        return TradingStatistics.builder()
                .member(member)
                .build();
    }

    // ============================================
    // 통계 업데이트 메서드
    // ============================================

    /**
     * 거래 완료 시 통계 업데이트
     * 
     * @param profitRate 해당 거래의 수익률 (%)
     */
    public void updateOnTradeComplete(BigDecimal profitRate) {
        this.totalTrades++;

        // 승/패 판정
        if (profitRate.compareTo(BigDecimal.ZERO) > 0) {
            this.winningTrades++;
        } else if (profitRate.compareTo(BigDecimal.ZERO) < 0) {
            this.losingTrades++;
        }
        // profitRate == 0 인 경우 승패 카운트 안함

        // 최대 수익률 갱신
        if (profitRate.compareTo(this.maxProfitRate) > 0) {
            this.maxProfitRate = profitRate;
        }

        // 최대 손실률 갱신 (더 작은 음수가 더 큰 손실)
        if (profitRate.compareTo(this.maxLossRate) < 0) {
            this.maxLossRate = profitRate;
        }
    }

    // ============================================
    // 계산 메서드
    // ============================================

    /**
     * 승률 계산 (%)
     */
    public BigDecimal getWinRate() {
        if (totalTrades == 0) return BigDecimal.ZERO;
        return BigDecimal.valueOf(winningTrades)
                .multiply(BigDecimal.valueOf(100))
                .divide(BigDecimal.valueOf(totalTrades), 2, RoundingMode.HALF_UP);
    }
}
