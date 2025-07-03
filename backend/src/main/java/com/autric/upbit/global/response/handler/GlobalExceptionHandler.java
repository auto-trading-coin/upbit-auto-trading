package com.autric.upbit.global.response.handler;

import com.autric.upbit.global.response.code.ErrorCode;
import com.autric.upbit.global.response.code.ResponseCode;
import com.autric.upbit.global.response.exception.RestApiException;
import com.autric.upbit.global.response.structure.ErrorResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;
import jakarta.validation.ConstraintViolationException;
import jakarta.validation.ConstraintViolation;


import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

/**
 * GlobalExceptionHandler 클래스는 전역적으로 발생하는 예외를 처리하여
 * 클라이언트에게 일관된 에러 응답을 반환
 *
 * @RestControllerAdvice를 통해 전역 예외 핸들링을 구성하며,
 * 커스텀 예외(RestApiException), 유효성 검사 실패, 타입 불일치 등 다양한 상황을 처리
 * 에러 응답은 ErrorResponse 형태로 통일되며, 내부적으로 ResponseCode 기반으로 메시지 구성
 */
@RestControllerAdvice
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {

    /**
     * 커스텀 예외인 RestApiException 처리
     *
     * 서비스 레이어에서 명시적으로 발생시킨 예외
     * 내부에 포함된 ResponseCode를 통해 응답 상태와 메시지 결정
     */
    @ExceptionHandler(RestApiException.class)
    public ResponseEntity<Object> handleRestApiException(final RestApiException e) {
        final ResponseCode responseCode = e.getResponseCode();
        return handleExceptionInternal(responseCode);
    }

    /**
     * 잘못된 요청 파라미터 등 비즈니스 로직 오류 처리
     *
     * IllegalArgumentException 발생 시
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Object> handleIllegalArgument(final IllegalArgumentException e) {
        final ResponseCode responseCode = ErrorCode.INVALID_PARAMETER;
        return handleExceptionInternal(responseCode, e.getMessage());
    }

    /**
     * RequestBody에 대한 유효성 검증 실패 처리
     *
     * @Valid, @Validated 등으로 검증 실패 시 호출
     * MethodArgumentNotValidException 발생 시
     */
    @Override
    protected ResponseEntity<Object> handleMethodArgumentNotValid(
            MethodArgumentNotValidException e,
            HttpHeaders headers,
            HttpStatusCode status,
            WebRequest request) {
        final ResponseCode responseCode = ErrorCode.INVALID_PARAMETER;
        return handleExceptionInternal(e, responseCode);
    }

    /**
     * RequestParam, PathVariable 등 유효성 검증 실패 처리
     *
     * @NotNull, @Min 등으로 유효성 위반 시 ConstraintViolationException 발생
     */
    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<Object> handleConstraintViolationException(final ConstraintViolationException e) {
        final ResponseCode responseCode = ErrorCode.INVALID_PARAMETER;
        return handleExceptionInternal(e, responseCode);
    }

    /**
     * RequestParam, PathVariable의 타입이 다를 경우 처리
     *
     * Long 타입에 문자열 전달 시 MethodArgumentTypeMismatchException 발생
     */
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<Object> handleMethodArgumentTypeMismatchException(final MethodArgumentTypeMismatchException e) {
        final ResponseCode responseCode = ErrorCode.INVALID_PARAMETER;
        return handleExceptionInternal(responseCode, responseCode.getMessage());
    }

    /**
     * 명시되지 않은 모든 예외를 처리하는 fallback 핸들러
     *
     * 개발자가 정의하지 않은 예외가 발생했을 때 실행됨
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Object> handleAllException(final Exception e) {
        final ResponseCode responseCode = ErrorCode.INTERNAL_SERVER_ERROR;
        return handleExceptionInternal(responseCode);
    }

    /**
     * 단순한 ResponseCode 기반 기본 에러 응답 생성
     */
    private ResponseEntity<Object> handleExceptionInternal(final ResponseCode responseCode) {
        return ResponseEntity.status(responseCode.getHttpStatus())
                .body(makeErrorResponse(responseCode));
    }

    /**
     * 커스텀 메시지를 포함한 에러 응답 생성
     */
    private ResponseEntity<Object> handleExceptionInternal(final ResponseCode responseCode, final String message) {
        return ResponseEntity.status(responseCode.getHttpStatus())
                .body(makeErrorResponse(responseCode, message));
    }

    /**
     * BindingResult 기반 유효성 검증 실패 응답 생성 (RequestBody)
     */
    private ResponseEntity<Object> handleExceptionInternal(final BindException e, final ResponseCode responseCode) {
        return ResponseEntity.status(responseCode.getHttpStatus())
                .body(makeErrorResponse(e, responseCode));
    }

    /**
     * ConstraintViolation 기반 유효성 검증 실패 응답 생성 (RequestParam, PathVariable)
     */
    private ResponseEntity<Object> handleExceptionInternal(final ConstraintViolationException e, final ResponseCode responseCode) {
        return ResponseEntity.status(responseCode.getHttpStatus())
                .body(makeErrorResponse(e, responseCode));
    }

    /**
     * 단순 메시지 기반 ErrorResponse 생성
     */
    private ErrorResponse makeErrorResponse(final ResponseCode responseCode) {
        return ErrorResponse.builder()
                .code(responseCode.name())
                .message(responseCode.getMessage())
                .build();
    }

    /**
     * 커스텀 메시지를 포함한 ErrorResponse 생성
     */
    private ErrorResponse makeErrorResponse(final ResponseCode responseCode, final String message) {
        return ErrorResponse.builder()
                .code(responseCode.name())
                .message(message)
                .build();
    }

    /**
     * FieldError 기반 에러 Map을 포함하는 ErrorResponse 생성
     * - RequestBody 검증 실패 시 어떤 필드에 어떤 에러가 있었는지 포함
     */
    private ErrorResponse makeErrorResponse(final BindException e, final ResponseCode responseCode) {
        final Map<String, String> errors = e.getBindingResult()
                .getFieldErrors()
                .stream()
                .collect(Collectors.toMap(
                        FieldError::getField,
                        fieldError -> Optional.ofNullable(fieldError.getDefaultMessage()).orElse("")
                ));

        return ErrorResponse.builder()
                .code(responseCode.name())
                .message(responseCode.getMessage())
                .errors(errors)
                .build();
    }

    /**
     * ConstraintViolation 기반 에러 Map을 포함하는 ErrorResponse 생성
     * - PathVariable, RequestParam 검증 실패 시 어떤 파라미터에 어떤 메시지가 있는지 포함
     */
    private ErrorResponse makeErrorResponse(final ConstraintViolationException e, final ResponseCode responseCode) {
        Map<String, String> errors = e.getConstraintViolations().stream()
                .collect(Collectors.toMap(
                        violation -> StreamSupport.stream(violation.getPropertyPath().spliterator(), false)
                                .reduce((first, second) -> second)
                                .get().toString(),
                        ConstraintViolation::getMessage
                ));

        return ErrorResponse.builder()
                .code(responseCode.name())
                .message(responseCode.getMessage())
                .errors(errors)
                .build();
    }

}
