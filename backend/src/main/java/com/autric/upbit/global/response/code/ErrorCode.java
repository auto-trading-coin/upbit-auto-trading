package com.autric.upbit.global.response.code;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

/**
 * API 실패 응답에 대한 에러 코드 집합
 *
 * 각 항목은 HTTP 상태 코드와 사용자 메시지를 포함
 * 모든 에러 응답은 이 enum을 기준으로 처리됨
 */
@Getter
@RequiredArgsConstructor
public enum ErrorCode implements ResponseCode {

    /*
        Common
     */
    INVALID_PARAMETER(HttpStatus.BAD_REQUEST, "유효하지 않은 파라미터입니다."),
    UNAUTHORIZED_REQUEST(HttpStatus.UNAUTHORIZED, "인증되지 않은 사용자입니다."),
    RESOURCE_NOT_FOUND(HttpStatus.NOT_FOUND, "리소스가 존재하지 않습니다."),
    METHOD_NOT_ALLOWED(HttpStatus.METHOD_NOT_ALLOWED, "허용되지 않은 METHOD 요청입니다."),
    INTERNAL_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "서버에서 오류가 발생했습니다."),
    INVALID_REQUEST(HttpStatus.BAD_REQUEST, "잘못된 요청입니다."),

    /*
        Member
     */
    MEMBER_NOT_FOUND(HttpStatus.NOT_FOUND, "존재하지 않는 사용자입니다."),


    /*
        Token
     */
    EXPIRED_TOKEN(HttpStatus.UNAUTHORIZED, "토큰이 만료 되었습니다."),
    INVALID_TOKEN(HttpStatus.BAD_REQUEST, "잘못된 토큰입니다."),
    UNSUPPORTED_TOKEN(HttpStatus.FORBIDDEN, "잘못된 토큰입니다."),

    /*
        Upbit
     */
    INVALID_UPBIT_API_KEY(HttpStatus.BAD_REQUEST, "유효하지 않은 업비트 API KEY 입니다"),
    DUPLICATE_UPBIT_API_KEY(HttpStatus.BAD_REQUEST, "중복된 API KEY 입니다."),
    UPBIT_API_KEY_NOT_FOUND(HttpStatus.NOT_FOUND, "업비트 API KEY가 등록되지 않았습니다."),

    /*
        Strategy
     */
    STRATEGY_NOT_FOUND(HttpStatus.NOT_FOUND, "존재하지 않는 전략입니다.");

    private final HttpStatus httpStatus;
    private final String message;

}