package com.autric.upbit.external.upbit.client;

import com.autric.upbit.domain.chart.entity.Market;
import com.autric.upbit.external.upbit.dto.response.UpbitCandleResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * 업비트 데이터를 조회하는 API 클라이언트입니다.
 *
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class UpbitApiClient {

    private final WebClient upbitWebClient;
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
}
