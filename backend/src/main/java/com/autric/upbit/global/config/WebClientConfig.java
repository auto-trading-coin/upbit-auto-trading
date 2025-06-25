package com.autric.upbit.global.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

/**
 * WebClientConfig
 * - 공통 WebClient Bean 구성
 * - Upbit API 및 기타 외부 API 요청용
 */
@Configuration
public class WebClientConfig {

    /**
     * Upbit API 요청용 WebClient
     *
     * @return WebClient 인스턴스
     */
    @Bean
    public WebClient upbitWebClient(){
        return WebClient.builder()
                .baseUrl("https://api.upbit.com")
                .build();
    }
}
