package com.autric.upbit.domain.chart.repository;

import com.autric.upbit.domain.chart.entity.Market;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MarketRepository extends JpaRepository<Market, Long> {

    Optional<Market> findByCoin (String coin);
}
