package com.autric.upbit.domain.member.entity;

import com.autric.upbit.domain.strategy.entity.Strategy;
import com.autric.upbit.domain.upbitApiKey.UpbitApiKey;
import jakarta.persistence.*;
import lombok.*;

/**
 * Member 엔티티
 */
@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@ToString
public class Member {

    /**
     * 멤버ID PK
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "member_id")
    private Long id;

    /**
     * 전략ID FK
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "strategy_id")
    private Strategy strategy;

    /**
     * 계정 이메일
     */
    @Column(length = 50)
    private String email;

    /**
     * 계정 닉네임
     */
    @Column(length = 20)
    private String nickname;

    /**
     * 소셜 로그인 도메인
     */
    @Column(length = 20)
    private String provider;

    /**
     * 소셜 로그인 id
     */
    @Column(name = "provider_id")
    private Long providerId;

    /**
     * 자동매매 적용 여부
     */
    @Column(name = "trade_active")
    private Boolean tradeActive;

    /**
     * 업비트 API 키
     */
    @OneToOne(mappedBy = "member", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @ToString.Exclude
    private UpbitApiKey upbitApiKey;

    @Builder
    public Member(Strategy strategy, String email, String nickname, String provider, Long providerId,
            Boolean tradeActive) {
        this.strategy = strategy;
        this.email = email;
        this.nickname = nickname;
        this.provider = provider;
        this.providerId = providerId;
        this.tradeActive = tradeActive;
    }

    /**
     * 매매 전략 설정 여부를 확인하는 편의 메서드
     */
    public boolean hasStrategy() {
        return strategy != null;
    }

    /**
     * 자동매매 상태를 변경하는 편의 메서드
     */
    public void updateTradeActive(boolean status) {
        this.tradeActive = status;
    }

    /**
     * 업비트 API키 등록 여부를 확인하는 편의 메서드
     */
    public boolean hasApiKey() {
        return upbitApiKey != null;
    }

    /**
     * 업비트 API 키 연관관계 설정
     */
    public void registerUpbitApiKey(UpbitApiKey apiKey) {
        this.upbitApiKey = apiKey;
        apiKey.changeMember(this);
    }

    /**
     * 업비트 API KEY를 삭제하는 편의 메서드
     */
    public void deleteUpbitApiKey() {
        if (this.upbitApiKey != null) {
            this.upbitApiKey.changeMember(null);
            this.upbitApiKey = null;
        }
    }

    /**
     * 매매 전략을 변경하는 편의 메서드
     */
    public void updateStrategy(Strategy strategy) {
        this.strategy = strategy;
    }
}
