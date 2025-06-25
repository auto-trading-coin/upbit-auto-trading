package com.autric.upbit.domain.chart.repository;

import com.autric.upbit.domain.chart.entity.Market;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MarketRepository extends JpaRepository<Market, Long> {
}
