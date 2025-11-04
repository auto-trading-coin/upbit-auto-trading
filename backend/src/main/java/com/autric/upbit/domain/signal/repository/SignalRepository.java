package com.autric.upbit.domain.signal.repository;

import com.autric.upbit.domain.signal.entity.Signals;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SignalRepository extends JpaRepository<Signals, Long> {
}
