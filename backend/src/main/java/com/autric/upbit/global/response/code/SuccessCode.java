package com.autric.upbit.global.response.code;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

/**
 * API 성공 응답에 대한 코드 집합
 * 각 항목은 HTTP 상태 코드와 사용자 메시지를 포함
 * 모든 성공 응답은 이 enum을 기준으로 응답 생성
 */
@Getter
@RequiredArgsConstructor
public enum SuccessCode implements ResponseCode {

    /*
     * MEMBER
     */
    LOGIN_SUCCESS(HttpStatus.OK, "로그인에 성공했습니다."),
    LOGOUT_SUCCESS(HttpStatus.OK, "로그아웃에 성공했습니다."),
    MEMBER_INFO_SUCCESS(HttpStatus.OK, "회원정보 조회에 성공했습니다."),
    UPDATE_TRADE_ACTIVE_SUCCESS(HttpStatus.OK, "자동매매 상태 변경에 성공했습니다."),
    DELETE_UPBIT_API_KEY_SUCCESS(HttpStatus.OK, "업비트 API KEY 삭제에 성공했습니다."),

    /*
     * STRATEGY
     */
    STRATEGIES_INFO_SUCCESS(HttpStatus.OK, "전략 목록 조회에 성공했습니다."),
    STRATEGY_DETAIL_INFO_SUCCESS(HttpStatus.OK, "전략 상세 조회에 성공했습니다."),

    /*
     * TOKEN
     */
    TOKEN_REISSUE_SUCCESS(HttpStatus.CREATED, "토큰 재발급에 성공했습니다."),

    /*
     * Upbit
     */
    REGISTER_UPBIT_API_KEY_SUCCESS(HttpStatus.CREATED, "업비트 API KEY 등록에 성공했습니다."),
    UPBIT_MARKETS_SUCCESS(HttpStatus.OK, "업비트 Market 정보 조회에 성공했습니다."),
    UPBIT_ACCOUNTS_SUCCESS(HttpStatus.OK, "업비트 계좌 정보 조회에 성공했습니다."),
    /*
     * Strategy
     */
    UPDATE_STRATEGY_SUCCESS(HttpStatus.OK, "자동매매 전략 변경에 성공했습니다."),

    /*
     * Orders
     */
    ORDER_LIST_SUCCESS(HttpStatus.OK, "주문 목록 조회에 성공했습니다."),

    /*
     * Signals
     */
    SIGNAL_LIST_SUCCESS(HttpStatus.OK, "시그널 목록 조회에 성공했습니다."),
    SIGNAL_DETAIL_SUCCESS(HttpStatus.OK, "시그널 조회에 성공했습니다."),

    /*
     * Portfolio / Profit
     */
    GET_PROFIT_SUCCESS(HttpStatus.OK, "투자손익 조회에 성공했습니다.");

    private final HttpStatus httpStatus;
    private final String message;
}
