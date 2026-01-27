package com.autric.upbit.domain.member.repository;

import com.autric.upbit.domain.member.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface MemberRepository extends JpaRepository<Member, Long> {
    Optional<Member> findByProviderAndProviderId(String provider, Long providerId);

    // 전략ID가 일치하고 자동매매 활성(true)인 회원 + API Key를 함께 조회 (N+1 방지)
    @Query("select m from Member m " +
            "join fetch m.upbitApiKey " +
            "where m.tradeActive = true " +
            "  and m.strategy.id = :strategyId")
    List<Member> findActiveMembersByStrategyId(Long strategyId);
}
