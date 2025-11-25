package com.autric.upbit.domain.upbitApiKey;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UpbitApiKeyRepository extends JpaRepository<UpbitApiKey, Long> {
    
    boolean existsByAccessKey(String accessKey);
    
    Optional<UpbitApiKey> findByMemberId(Long memberId);
}
