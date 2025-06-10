package com.autric.upbit.domain.signal.entity;

import com.autric.upbit.domain.member.entity.Member;
import jakarta.persistence.*;
import lombok.*;

/**
 * 회원-신호 매핑(MemberSignal) Entity
 */
@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "member_signal")
@ToString
public class MemberSignal {

    /**
     * PK
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "member_signal_id")
    private Long id;

    /**
     * 회원ID FK
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id")
    private Member member;

    /**
     * 신호ID FK
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "signal_id")
    private Signals signals;

    /**
     * 생성자 (Builder 패턴 사용)
     */
    @Builder
    public MemberSignal(Member member, Signals signals) {
        this.member = member;
        this.signals = signals;
    }
}