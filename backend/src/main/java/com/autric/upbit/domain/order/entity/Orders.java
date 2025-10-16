package com.autric.upbit.domain.order.entity;

import com.autric.upbit.domain.chart.entity.Market;
import com.autric.upbit.domain.member.entity.Member;
import com.autric.upbit.domain.signal.entity.Signals;
import com.autric.upbit.global.entity.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

/**
 * 주문 내역
 */
@Entity
@Table(name = "orders")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@ToString
public class Orders extends BaseTimeEntity {

    /**
     * 주문ID PK
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "orders_id")
    private Long id;

    /**
     * 멤버ID FK
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id")
    private Member member;

    /**
     * 마켓ID FK
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "market_id")
    private Market market;

    /**
     * 멤버시그널ID FK
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "signal_id")
    private Signals signal;

    /**
     * 주문 UUID (주문 성공 시)
     */
    @Column(length = 64, unique = true)
    private String uuid;

    /**
     * 주문 방향 (Enum)
     */
    @Enumerated(EnumType.STRING)
    @Column(length = 10)
    private Side side;

    /**
     * 주문유형 (Enum)
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "ord_type", length = 10)
    private OrderType ordType;

    /**
     * 주문 수량
     */
    @Column(precision = 24, scale = 12)
    private BigDecimal volume;

    /**
     * 주문가 (시장가 주문일 경우 NULL 가능)
     */
    @Column(precision = 18, scale = 8)
    private BigDecimal price;

    /**
     * 주문 요청 처리 결과 상태 (Enum)
     */
    @Enumerated(EnumType.STRING)
    @Column(length = 10)
    private OrderStatus status;

    /**
     * 주문 실패 시 오류 메시지 내용
     */
    @Column(name = "error_message")
    private String errorMessage;


    @Builder
    public Orders(Member member, Market market, Signals signal, String uuid, Side side,
                  OrderType ordType, BigDecimal volume, BigDecimal price,
                  OrderStatus status, String errorMessage) {

        this.member = member;
        this.market = market;
        this.signal = signal;
        this.uuid = uuid;
        this.side = side;
        this.ordType = ordType;
        this.volume = volume;
        this.price = price;
        this.status = status;
        this.errorMessage = errorMessage;
    }

}
