package com.autric.upbit.domain.order.repository;

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
     * 회원별 주문 목록 조회 with 필터링 (마켓, 날짜 범위, 매수/매도)
     */
    @Query("SELECT o FROM Orders o " +
            "JOIN FETCH o.market m " +
            "LEFT JOIN FETCH o.signal s " +
            "LEFT JOIN FETCH s.strategy " +
            "WHERE o.member.id = :memberId " +
            "AND (:market IS NULL OR m.coin = :market) " +
            "AND (:startDate IS NULL OR o.createdAt >= :startDate) " +
            "AND (:endDate IS NULL OR o.createdAt < :endDate) " +
            "AND (:side IS NULL OR o.side = :side) " +
            "ORDER BY o.createdAt DESC")
    Page<Orders> findByMemberIdWithFilters(
            @Param("memberId") Long memberId,
            @Param("market") String market,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            @Param("side") Side side,
            Pageable pageable);

    /**
     * 시그널 ID로 주문 조회 (시그널 -> 주문 역참조)
     */
    List<Orders> findBySignalId(Long signalId);
}
