package com.autric.upbit.external.upbit.client;

import com.autric.upbit.domain.chart.entity.Market;
import com.autric.upbit.external.upbit.dto.response.UpbitAccountResponse;
import com.autric.upbit.external.upbit.dto.response.UpbitCandleResponse;
import com.autric.upbit.external.upbit.dto.response.UpbitOrderResponse;
import com.autric.upbit.external.upbit.dto.response.UpbitTradePriceResponse;
import com.autric.upbit.external.upbit.util.UpbitUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * 업비트 데이터를 조회하는 API 클라이언트입니다.
 *
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class UpbitApiClient {

    private final WebClient upbitWebClient;
    private final UpbitUtil upbitUtil;
    private static final DateTimeFormatter UPBIT_TO_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    /**
     * KST(LocalDateTime)를 UTC 포맷 문자열로 변환합니다.
     *
     * @param kstTime KST 기준 시각
     * @return 업비트 API용 UTC 포맷 문자열 (yyyy-MM-dd HH:mm:ss)
     */
    private String formatToUtcParam(LocalDateTime kstTime) {
        if(kstTime == null) return null;
        return kstTime
                .atZone(ZoneId.of("Asia/Seoul"))
                .withZoneSameInstant(ZoneId.of("UTC"))
                .format(UPBIT_TO_FORMATTER);
    }

    /**
     * 업비트 분봉 캔들 데이터를 조회합니다.
     *
     * @param market 마켓 정보 (예: KRW-BTC)
     * @param unit 캔들 단위 (예: 1, 5, 30, 60, 240)
     * @param count 조회할 캔들 수 (최대 200)
     * @param to 조회 종료 시각 (KST)
     * @return 캔들 응답 리스트
     */
    public List<UpbitCandleResponse> getMinuteCandles(Market market, Integer unit, int count, LocalDateTime to) {
        String marketCode = market.getCoin();
        String toParam = formatToUtcParam(to);

        return upbitWebClient.get()
                .uri(uriBuilder -> {
                    uriBuilder.path("/v1/candles/minutes/" + unit)
                            .queryParam("market", marketCode)
                            .queryParam("count", count);
                    if(toParam != null) {
                        uriBuilder.queryParam("to", toParam);
                    }
                    return uriBuilder.build();
                })
                .retrieve()// 요청 전송 및 응답 수신 준비
                .bodyToFlux(UpbitCandleResponse.class)// 응답 본문을 Flux<UpbitMinuteCandleResponse>로 역직렬화
                .collectList()// Flux를 List로 수집
                .block();// 비동기 응답을 동기적으로 블로킹하여 반환
    }

    /**
     * 업비트 일봉 캔들 데이터를 조회합니다.
     *
     * @param market 마켓 정보 (예: KRW-BTC)
     * @param count 조회할 캔들 수 (최대 200)
     * @param to 조회 종료 시각 (KST)
     * @return 캔들 응답 리스트
     */
    public List<UpbitCandleResponse> getDayCandles(Market market, int count, LocalDateTime to) {
        String marketCode = market.getCoin();
        String toParam = formatToUtcParam(to);

        return upbitWebClient.get()
                .uri(uriBuilder -> {
                    uriBuilder.path("/v1/candles/days")
                            .queryParam("market", marketCode)
                            .queryParam("count", count);
                    if(toParam != null) {
                        uriBuilder.queryParam("to", toParam);
                    }
                    return uriBuilder.build();
                })
                .retrieve()
                .bodyToFlux(UpbitCandleResponse.class)
                .collectList()
                .block();
    }

    /**
     * 사용자의 업비트 계좌 정보를 조회합니다. (API 키 검증용)
     *
     * @param jwtToken 업비트 JWT
     */
    public void getAccount(String jwtToken) {
        upbitWebClient.get()
                .uri("/v1/accounts")
                .header("Authorization", "Bearer " + jwtToken)
                .retrieve()
                .bodyToMono(String.class) // 응답 필요 없으므로 검증만
                .block();
    }

    /**
     * 사용자의 업비트 계정 잔고 리스트 조회
     *
     * @param jwtToken 업비트 JWT
     * @return 사용자 별 잔고 리스트
     */
    public List<UpbitAccountResponse> getAccounts(String jwtToken) {
        return upbitWebClient.get()
                .uri("/v1/accounts")
                .header("Authorization", "Bearer " + jwtToken)
                .retrieve()
                .bodyToFlux(UpbitAccountResponse.class)
                .collectList()
                .block();
    }

    /**
     * 특정 페어를 매수/매도하기 위한 주문을 생성
     *
     * @param accessKey 업비트 키
     * @param secretKey 업비트 키
     * @param market 통화 코드 (예: KRW, KRW-BTC, KRW-ETH)
     * @param side 주문 방향 (예: bid, ask / 시장가 매수, 시장가 매도)
     * @param price 주문 단가 또는 총액
     * @param volume 주문 수량
     * @return UpbitOrderResponse
     */
    public UpbitOrderResponse upbitOrder(String accessKey, String secretKey, String market, String side, String price, String volume) {
        Map<String, String> params = new LinkedHashMap<>();
        params.put("market", market);
        params.put("side", side);  // bid : 시장가 매수, ask : 시장가 매도

        if(side.equals("bid")) {
            params.put("ord_type", "price");
            params.put("price", price);
        }
        else if(side.equals("ask")) {
            params.put("ord_type", "market");
            params.put("volume", volume);
        }
        String jwt = upbitUtil.createUpbitJwt(accessKey, secretKey, params);
        try {
            return upbitWebClient.post()
                    .uri("/v1/orders")
                    .header("Authorization", "Bearer " + jwt)
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.APPLICATION_JSON)
                    .bodyValue(params)
                    .retrieve()
                    .bodyToMono(UpbitOrderResponse.class)
                    .block();
        }
        catch (WebClientResponseException e) {
            // ★ 여기서 상태코드/헤더/오류 바디를 그대로 확인 가능
            log.error("Upbit order FAILED: status={}, body={}",
                    e.getRawStatusCode(), e.getResponseBodyAsString(), e);
            throw e; // 필요 시 도메인 예외로 변환해서 throw
        } catch (Exception e) {
            log.error("Upbit order FAILED (non-HTTP): {}", e.getMessage(), e);
            throw e;
        }
    }

    public UpbitTradePriceResponse getCurrentPrice(String marketCode) {
        return upbitWebClient.get()
                .uri(u -> u.path("/v1/ticker").queryParam("markets", marketCode).build())
                .retrieve()
                .bodyToFlux(UpbitTradePriceResponse.class)
                .next()
                .timeout(Duration.ofSeconds(5))
                .block(); // 블로킹
    }
}
