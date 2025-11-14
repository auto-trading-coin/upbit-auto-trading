package com.autric.upbit.domain.strategy.repository;

import com.autric.upbit.domain.strategy.entity.Strategy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StrategyRepository extends JpaRepository<Strategy, Long> {

    // 전체 전략 조회(사용되는 지표를 포함한 모든 전략)
    @Query("""
            select s
            from Strategy s
            left join fetch s.indicators si
            left join fetch si.indicator i
            order by s.id asc
            """)
    List<Strategy> findAllWithIndicators();

    // 개별 전략 조회(사용되는 지표 포함)
    @Query("""
           select s
           from Strategy s
           left join fetch s.indicators si
           left join fetch si.indicator i
           where s.id = :id
           """)
    Optional<Strategy> findOneWithIndicators(@Param("id") Long id);
}
