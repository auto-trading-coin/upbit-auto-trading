package com.autric.upbit.global.response.code;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

/**
 * API 성공 응답에 대한 코드 집합
 *
 * 각 항목은 HTTP 상태 코드와 사용자 메시지를 포함
 * 모든 성공 응답은 이 enum을 기준으로 응답 생성
 */
@Getter
@RequiredArgsConstructor
public enum SuccessCode implements ResponseCode {

    /*
        USER
     */
    LOGIN_SUCCESS(HttpStatus.OK, "로그인에 성공했습니다."),
    LOGOUT_SUCCESS(HttpStatus.OK, "로그아웃에 성공했습니다."),
    MEMBER_INFO_SUCCESS(HttpStatus.OK, "회원정보 조회에 성공했습니다."),
    UPDATE_TRADE_ACTIVE_SUCCESS(HttpStatus.OK, "자동매매 상태 변경에 성공했습니다."),

    /*
        TOKEN
     */
    TOKEN_REISSUE_SUCCESS(HttpStatus.CREATED, "토큰 재발급에 성공했습니다."),

    /*
        Upbit
     */
    REGISTER_UPBIT_API_KEY_SUCCESS(HttpStatus.CREATED, "업비트 API KEY 등록에 성공했습니다.");

    private final HttpStatus httpStatus;
    private final String message;
}
