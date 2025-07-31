package com.autric.upbit.domain.chart.repository.Chart240m;

import com.autric.upbit.domain.chart.entity.Chart240m;
import com.autric.upbit.domain.chart.entity.Market;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface Chart240mRepository extends JpaRepository<Chart240m, Long>, Chart240mRepositoryCustom {

    /**
     * Market + Unit 기준으로 특정 시각 이후 캔들 데이터 조회 (오름차순)
     *
     * @param market Market 엔티티
     * @param unit 캔들 단위
     * @param candleDateTimeKst 기준 시각
     * @return 캔들 데이터 리스트 (오름차순 정렬)
     */
    List<Chart240m> findByMarketAndUnitAndCandleDateTimeKstAfterOrderByCandleDateTimeKstAsc(Market market, Integer unit, LocalDateTime candleDateTimeKst);

    /**
     * Market + Unit 기준으로 최신 캔들 1건 조회 (내림차순 → 최신 1건)
     *
     * @param market Market 엔티티
     * @param unit 캔들 단위
     * @return 최신 캔들 Optional
     */
    Optional<Chart240m> findFirstByMarketAndUnitOrderByCandleDateTimeKstDesc(Market market, Integer unit);
}
