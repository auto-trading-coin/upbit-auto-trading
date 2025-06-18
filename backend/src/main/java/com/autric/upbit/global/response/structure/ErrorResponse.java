package com.autric.upbit.global.response.structure;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

import java.util.Map;

/**
 * API 에러 응답 포맷을 정의하는 클래스
 * 모든 에러는 이 구조를 통해 JSON으로 반환
 */
@Getter
@Builder
@RequiredArgsConstructor
public class ErrorResponse {
	private final String code;
	private final String message;

	@JsonInclude(JsonInclude.Include.NON_EMPTY)
	private final Map<String, String> errors;
}
