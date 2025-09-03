package com.autric.upbit.domain.member.repository;

import com.autric.upbit.domain.member.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface MemberRepository extends JpaRepository<Member, Long> {
    Optional<Member> findByProviderAndProviderId(String provider, Long providerId);

    // 업비트 엑세스 키 중복 확인
    boolean existsByAccessKey(String accessKey);

    // 전략ID가 일치하고 자동매매 활성(true)인 회원 조회
    @Query("select m from Member m " +
            "where m.tradeActive = true " +
            "  and m.strategy.id = :strategyId")
    List<Member> findActiveMembersByStrategyId(Long strategyId);
}
