package com.autric.upbit.domain.signal.repository;

import com.autric.upbit.domain.signal.entity.Signals;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface SignalRepository extends JpaRepository<Signals, Long> {

        /**
         * 모든 시그널 목록 조회 (페이징)
         */
        @Query(value = "SELECT s FROM Signals s " +
                        "JOIN FETCH s.strategy " +
                        "JOIN FETCH s.market " +
                        "ORDER BY s.createdAt DESC", countQuery = "SELECT COUNT(s) FROM Signals s")
        Page<Signals> findSignalsByMember(Pageable pageable);

        /**
         * 모든 시그널 목록 조회 with 필터링 (마켓, 날짜 범위, 전략)
         */
        @Query(value = "SELECT s FROM Signals s " +
                        "JOIN FETCH s.strategy st " +
                        "JOIN FETCH s.market m " +
                        "WHERE (:market IS NULL OR m.coin = :market) " +
                        "AND (:startDate IS NULL OR s.createdAt >= :startDate) " +
                        "AND (:endDate IS NULL OR s.createdAt < :endDate) " +
                        "AND (:strategyId IS NULL OR st.id = :strategyId) " +
                        "ORDER BY s.createdAt DESC", countQuery = "SELECT COUNT(s) FROM Signals s " +
                                        "JOIN s.strategy st " +
                                        "JOIN s.market m " +
                                        "WHERE (:market IS NULL OR m.coin = :market) " +
                                        "AND (:startDate IS NULL OR s.createdAt >= :startDate) " +
                                        "AND (:endDate IS NULL OR s.createdAt < :endDate) " +
                                        "AND (:strategyId IS NULL OR st.id = :strategyId)")
        Page<Signals> findSignalsWithFilters(
                        @Param("market") String market,
                        @Param("startDate") LocalDateTime startDate,
                        @Param("endDate") LocalDateTime endDate,
                        @Param("strategyId") Long strategyId,
                        Pageable pageable);

        /**
         * ID 목록으로 시그널 조회 (Fetch Join)
         */
        @Query("SELECT s FROM Signals s " +
                        "JOIN FETCH s.strategy " +
                        "JOIN FETCH s.market " +
                        "WHERE s.id IN :signalIds")
        List<Signals> findByIdInWithDetails(@Param("signalIds") List<Long> signalIds);
}
