package com.autric.upbit.external.upbit.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.math.BigDecimal;

/**
 * 업비트 입금 내역 응답 DTO
 * API: GET /v1/deposits
 */
@Getter
@NoArgsConstructor
@ToString
public class UpbitDepositResponse {

    /** 입출금 종류 */
    private String type;

    /** 입금에 대한 고유 아이디 */
    private String uuid;

    /** 화폐를 의미하는 영문 대문자 코드 */
    private String currency;

    /** 입금의 트랜잭션 아이디 */
    private String txid;

    /** 입금 상태 (PROCESSING, ACCEPTED, CANCELLED, REJECTED, TRAVEL_RULE_SUSPECTED, REFUNDING, REFUNDED) */
    private String state;

    /** 입금 생성 시간 */
    @JsonProperty("created_at")
    private String createdAt;

    /** 입금 완료 시간 */
    @JsonProperty("done_at")
    private String doneAt;

    /** 입금 수량 */
    private BigDecimal amount;

    /** 입금 수수료 */
    private BigDecimal fee;

    /** 입금 유형 (default: 일반입금, internal: 바로입금) */
    @JsonProperty("transaction_type")
    private String transactionType;
}
