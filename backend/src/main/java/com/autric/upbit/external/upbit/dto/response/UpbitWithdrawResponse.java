package com.autric.upbit.external.upbit.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.math.BigDecimal;

/**
 * 업비트 출금 내역 응답 DTO
 * API: GET /v1/withdraws
 */
@Getter
@NoArgsConstructor
@ToString
public class UpbitWithdrawResponse {

    /** 입출금 종류 */
    private String type;

    /** 출금에 대한 고유 아이디 */
    private String uuid;

    /** 화폐를 의미하는 영문 대문자 코드 */
    private String currency;

    /** 출금의 트랜잭션 아이디 */
    private String txid;

    /** 출금 상태 (WAITING, PROCESSING, DONE, FAILED, CANCELLED, REJECTED) */
    private String state;

    /** 출금 생성 시간 */
    @JsonProperty("created_at")
    private String createdAt;

    /** 출금 완료 시간 */
    @JsonProperty("done_at")
    private String doneAt;

    /** 출금 수량 */
    private BigDecimal amount;

    /** 출금 수수료 */
    private BigDecimal fee;

    /** 출금 유형 (default: 일반출금, internal: 바로출금) */
    @JsonProperty("transaction_type")
    private String transactionType;
}
