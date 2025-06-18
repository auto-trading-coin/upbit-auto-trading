package com.autric.upbit.global.response.structure;

import com.autric.upbit.global.response.code.SuccessCode;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;

/**
 * API 성공 응답 구조
 *
 * code: 성공 코드 이름 (SuccessCode.name())
 * message: 사용자에게 보여줄 메시지
 * data: 실제 반환할 데이터 (없으면 생략됨)
 */
@Getter
@Builder
@RequiredArgsConstructor
public class SuccessResponse<T> {
    private final String code;
    private final String message;

    @JsonInclude(JsonInclude.Include.NON_EMPTY)
    private final T data;

    /**
     * 데이터가 포함된 성공 응답 객체 생성
     */
    public static <T> ResponseEntity<Object> createSuccess(final SuccessCode successCode, final T data) {
        return ResponseEntity.status(successCode.getHttpStatus())
                .body(SuccessResponse.builder()
                        .code(successCode.name())
                        .message(successCode.getMessage())
                        .data(data)
                        .build()
                );
    }

    /**
     * 데이터가 포함되지 않은 성공 응답 객체 생성
     */
    public static <T> ResponseEntity<Object> createSuccess(final SuccessCode successCode) {
        return ResponseEntity.status(successCode.getHttpStatus())
                .body(SuccessResponse.builder()
                        .code(successCode.name())
                        .message(successCode.getMessage())
                        .build()
                );
    }
}
