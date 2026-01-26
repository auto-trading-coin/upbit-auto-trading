package com.autric.upbit.global.config;

import jakarta.annotation.PreDestroy;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * 비동기 처리를 위한 스레드 풀 설정
 * 
 * 시그널 처리 시 회원별 주문을 병렬로 처리하기 위해
 * 50개의 고정 스레드 풀을 생성합니다.
 * 
 * 서버 스펙: Oracle Cloud VM.Standard.A1.Flex (4 OCPU, 24GB RAM)
 */
@Configuration
public class AsyncConfig {

    /**
     * 주문 처리용 스레드 풀
     * 
     * - 50개 스레드로 병렬 처리
     * - I/O Bound 작업(API 호출)이므로 CPU 코어 수보다 많이 설정
     */
    @Bean
    public ExecutorService orderExecutor() {
        return Executors.newFixedThreadPool(50);
    }

    /**
     * 애플리케이션 종료 시 스레드 풀 정리
     */
    @PreDestroy
    public void shutdownExecutor() {
        orderExecutor().shutdown();
    }
}
