package com.autric.upbit.domain.chart.sync;

import com.autric.upbit.domain.chart.entity.*;
import com.autric.upbit.domain.chart.repository.*;
import com.autric.upbit.external.upbit.dto.response.UpbitCandleResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * 캔들 데이터를 단위별로 변환 및 저장하는 헬퍼 클래스입니다.
 *
 * <p>Upbit API에서 수신한 응답을 DB 엔티티로 변환하고,
 * 단위별 Repository를 통해 안전하게 저장합니다.
 *
 * @see EntitySaver
 * @see UpbitCandleResponse
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class ChartPersistHelper {

    private final Chart1mRepository chart1mRepository;
    private final Chart5mRepository chart5mRepository;
    private final Chart30mRepository chart30mRepository;
    private final Chart60mRepository chart60mRepository;
    private final Chart240mRepository chart240mRepository;
    private final Chart1dRepository chart1dRepository;
    private final EntitySaver entitySaver;

    /**
     * 단위(unit)에 따라 캔들 데이터를 해당 Repository로 안전하게 저장합니다.
     *
     * @param responses Upbit에서 받아온 캔들 응답 리스트
     * @param market 대상 마켓
     * @param unit 캔들 단위 (1, 5, 30, 60, 240, 1440)
     * @throws IllegalArgumentException 지원하지 않는 단위일 경우
     */
    public void persistByUnit(List<UpbitCandleResponse> responses, Market market, int unit) {
        switch (unit) {
            case 1 -> saveAllSafely(toChart1m(responses, market, unit), chart1mRepository);
            case 5 -> saveAllSafely(toChart5m(responses, market, unit), chart5mRepository);
            case 30 -> saveAllSafely(toChart30m(responses, market, unit), chart30mRepository);
            case 60 -> saveAllSafely(toChart60m(responses, market, unit), chart60mRepository);
            case 240 -> saveAllSafely(toChart240m(responses, market, unit), chart240mRepository);
            case 1440 -> saveAllSafely(toChart1d(responses, market), chart1dRepository);
            default -> throw new IllegalArgumentException("지원하지 않는 unit: " + unit);
        }
    }

    /**
     * 주어진 엔티티 리스트를 개별 저장 방식으로 안전하게 저장합니다.
     * 저장 중 예외 발생 시 즉시 중단하며 이전까지 저장된 항목은 유지됩니다.
     *
     * @param entityList 저장할 엔티티 리스트
     * @param repository 대상 JPA Repository
     * @param <T> 엔티티 타입
     */
    public <T> void saveAllSafely(List<T> entityList, JpaRepository<T, ?> repository) {
        int Count = 0;
        for (T entity : entityList) {
            try {
                entitySaver.saveOne(repository, entity);
                Count++;
            } catch (ObjectOptimisticLockingFailureException ex) {
                log.warn("개별 저장 실패 → 낙관적 락 충돌 또는 삭제됨: {}", entity, ex.getMessage());
                throw ex;
            } catch (DataIntegrityViolationException ex) {
                break;
            } catch (Exception ex) {
                log.error("개별 저장 중 알 수 없는 오류 발생: {}", entity, ex.getMessage());
                throw ex;
            }
        }

        if(Count > 0){
            log.info("캔들 총 {}건 저장됨", Count);
        }
    }

    private List<Chart1m> toChart1m(List<UpbitCandleResponse> responses, Market market, int unit) {
        return responses.stream().map(r -> r.toChart1mEntity(market, unit)).toList();
    }

    private List<Chart5m> toChart5m(List<UpbitCandleResponse> responses, Market market, int unit) {
        return responses.stream().map(r -> r.toChart5mEntity(market, unit)).toList();
    }

    private List<Chart30m> toChart30m(List<UpbitCandleResponse> responses, Market market, int unit) {
        return responses.stream().map(r -> r.toChart30mEntity(market, unit)).toList();
    }

    private List<Chart60m> toChart60m(List<UpbitCandleResponse> responses, Market market, int unit) {
        return responses.stream().map(r -> r.toChart60mEntity(market, unit)).toList();
    }

    private List<Chart240m> toChart240m(List<UpbitCandleResponse> responses, Market market, int unit) {
        return responses.stream().map(r -> r.toChart240mEntity(market, unit)).toList();
    }

    private List<Chart1d> toChart1d(List<UpbitCandleResponse> responses, Market market) {
        return responses.stream().map(r -> r.toChart1dEntity(market, 1440)).toList();
    }
}
