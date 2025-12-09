package com.autric.upbit.domain.order.repository;

import com.autric.upbit.domain.chart.entity.Market;
import com.autric.upbit.domain.member.entity.Member;
import com.autric.upbit.domain.order.entity.Orders;
import com.autric.upbit.domain.order.entity.Side;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Orders, Long> {

    /**
     * 회원별 주문 목록 조회 (Fetch Join으로 N+1 방지)
     */
    @Query("SELECT o FROM Orders o " +
            "JOIN FETCH o.market " +
            "LEFT JOIN FETCH o.signal s " +
            "LEFT JOIN FETCH s.strategy " +
            "WHERE o.member.id = :memberId " +
            "ORDER BY o.createdAt DESC")
    Page<Orders> findByMemberIdWithDetails(@Param("memberId") Long memberId, Pageable pageable);

    /**
     * 시그널 ID로 주문 조회 (시그널 -> 주문 역참조)
     */
    List<Orders> findBySignalId(Long signalId);

    /**
     * 회원별 주문 개수 조회
     */
    int countByMember(Member member);

    /**
     * 매도 주문에 매칭할 매수 주문 조회
     * 
     * 조건: 같은 회원, 같은 마켓, BID(매수), 매도 주문보다 이전에 생성된 것
     * 정렬: 가장 최근 매수 주문 (DESC)
     */
    Optional<Orders> findTopByMemberAndMarketAndSideAndCreatedAtBeforeOrderByCreatedAtDesc(
            Member member, Market market, Side side, LocalDateTime createdAt);
}
