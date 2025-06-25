package com.autric.upbit.domain.chart.sync;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

/**
 * 개별 엔티티를 별도 트랜잭션으로 안전하게 저장하는 컴포넌트입니다.
 *
 * <p>저장 실패 시 전체 트랜잭션에 영향을 주지 않도록
 * {@code REQUIRES_NEW} 전파 속성으로 트랜잭션을 분리합니다.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class EntitySaver {

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public <T> void saveOne(JpaRepository<T, ?> repository, T entity) {
        repository.save(entity); // 실패 시 여기서만 롤백
    }
}
