package com.autric.upbit.domain.chart.entity;

import com.autric.upbit.global.entity.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * ChartSyncMeta 엔티티
 */
@Entity
@Table(
        name = "chart_sync_meta",
        uniqueConstraints = @UniqueConstraint(columnNames = {"market_id", "unit"})
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@ToString
public class ChartSyncMeta extends BaseTimeEntity {

    /** 차트 싱크 메타 ID (PK) */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "chart_sync_meta_id")
    private Long id;

    /** 마켓 FK */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "market_id", nullable = false)
    private Market market;

    /** 캔들 단위 (ex: 1 = 1분, 5 = 5분) */
    @Column(name = "unit", nullable = false)
    private Integer unit;

    /** 마지막 싱크 완료 시각 */
    @Column(name = "last_synced_at")
    private LocalDateTime lastSyncedAt;

    /** 전체 싱크 완료 여부 */
    @Column(name = "is_full_synced", nullable = false)
    private boolean isFullSynced = false;

    @Builder
    public ChartSyncMeta(Market market, Integer unit, LocalDateTime lastSyncedAt, boolean isFullSynced) {
        this.market = market;
        this.unit = unit;
        this.lastSyncedAt = lastSyncedAt;
        this.isFullSynced = isFullSynced;
    }

    public void markFullSynced() {
        this.isFullSynced = true;
    }

    public void updateLastSyncedAt(LocalDateTime lastSyncedAt) {
        this.lastSyncedAt = lastSyncedAt;
    }
}
