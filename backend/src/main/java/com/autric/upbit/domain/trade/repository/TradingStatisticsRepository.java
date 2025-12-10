package com.autric.upbit.domain.trade.repository;

import com.autric.upbit.domain.member.entity.Member;
import com.autric.upbit.domain.trade.entity.TradingStatistics;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TradingStatisticsRepository extends JpaRepository<TradingStatistics, Long> {

    Optional<TradingStatistics> findByMember(Member member);
}
