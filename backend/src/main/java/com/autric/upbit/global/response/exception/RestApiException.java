package com.autric.upbit.global.response.exception;

import com.autric.upbit.global.response.code.ResponseCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

/**
 * 도메인 예외를 표현하는 커스텀 런타임 예외 클래스
 *
 * responseCode에 따라 어떤 에러인지 명확히 구분 가능
 * 서비스 계층에서 throw new RestApiException(...) 형태로 사용
 */
@Getter
@RequiredArgsConstructor
public class RestApiException extends RuntimeException {

	private final ResponseCode responseCode;
}
