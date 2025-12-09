package com.autric.upbit.domain.account.repository;

import com.autric.upbit.domain.account.entity.AccountHistory;
import com.autric.upbit.domain.member.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface AccountRepository extends JpaRepository<AccountHistory, Long> {

    /**
     * 특정 멤버의 특정 날짜 스냅샷 조회
     */
    Optional<AccountHistory> findByMemberAndSnapshotDate(Member member, LocalDate snapshotDate);

    /**
     * 특정 멤버의 가장 최근 스냅샷 조회
     */
    Optional<AccountHistory> findTopByMemberOrderBySnapshotDateDesc(Member member);

    /**
     * 특정 멤버의 특정 날짜 이전 가장 최근 스냅샷 조회 (전일 데이터 조회용)
     */
    Optional<AccountHistory> findTopByMemberAndSnapshotDateBeforeOrderBySnapshotDateDesc(
            Member member, LocalDate date);

    /**
     * 특정 멤버의 특정 연월 일별 데이터 조회 (최신순)
     */
    @Query("SELECT ah FROM AccountHistory ah " +
           "WHERE ah.member = :member " +
           "AND YEAR(ah.snapshotDate) = :year " +
           "AND MONTH(ah.snapshotDate) = :month " +
           "ORDER BY ah.snapshotDate DESC")
    List<AccountHistory> findDailyByMemberAndYearMonth(
            @Param("member") Member member,
            @Param("year") int year,
            @Param("month") int month);

    /**
     * 특정 멤버의 특정 연도 데이터 조회 (월별 집계용)
     */
    @Query("SELECT ah FROM AccountHistory ah " +
           "WHERE ah.member = :member " +
           "AND YEAR(ah.snapshotDate) = :year " +
           "ORDER BY ah.snapshotDate ASC")
    List<AccountHistory> findByMemberAndYear(
            @Param("member") Member member,
            @Param("year") int year);

    /**
     * 특정 멤버의 전체 데이터 조회 (연도별 집계용)
     */
    List<AccountHistory> findByMemberOrderBySnapshotDateAsc(Member member);

    /**
     * 특정 멤버의 가장 오래된 스냅샷 조회 (거래 시작일 확인용)
     */
    Optional<AccountHistory> findTopByMemberOrderBySnapshotDateAsc(Member member);

    /**
     * 특정 멤버의 전체 데이터 개수 조회
     */
    long countByMember(Member member);

    /**
     * 특정 멤버의 특정 기간 데이터 조회
     */
    @Query("SELECT ah FROM AccountHistory ah " +
           "WHERE ah.member = :member " +
           "AND ah.snapshotDate BETWEEN :startDate AND :endDate " +
           "ORDER BY ah.snapshotDate ASC")
    List<AccountHistory> findByMemberAndDateRange(
            @Param("member") Member member,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);
}
