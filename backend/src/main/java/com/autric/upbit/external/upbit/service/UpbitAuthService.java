package com.autric.upbit.external.upbit.service;

import com.autric.upbit.external.upbit.client.UpbitApiClient;
import com.autric.upbit.external.upbit.dto.request.UpbitAuthRequest;
import com.autric.upbit.global.response.code.ErrorCode;
import com.autric.upbit.global.response.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClientResponseException;

@Slf4j
@Service
@RequiredArgsConstructor
public class UpbitAuthService {

    private final UpbitApiClient upbitApiClient;


    /** 사용자의 accessKey/secretKey가 유효한 Upbit 키인지 확인
     *
     * @param dto
     */

    public void isValidUpbitKey(UpbitAuthRequest dto) {
        try {

            upbitApiClient.getAccount(dto.getAccessKey(), dto.getSecretKey()); // 요청 성공 = 키 유효
        } catch (WebClientResponseException e) {
            log.warn("업비트 API 키 유효성 실패 - 상태코드: {}, 응답: {}", e.getStatusCode(), e.getResponseBodyAsString());
            throw new BusinessException(ErrorCode.INVALID_UPBIT_API_KEY);
        } catch (Exception e) {
            log.error("업비트 키 검증 중 예상치 못한 오류 발생", e);
            throw new BusinessException(ErrorCode.INVALID_UPBIT_API_KEY);
        }
    }


}
