package com.autric.upbit.global.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.data.redis.RedisProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.StringRedisSerializer;

@RequiredArgsConstructor
@Configuration
public class RedisConfig {

    private final RedisProperties redisProperties;

    @Bean
    public RedisConnectionFactory redisConnectionFactory() {
        return new LettuceConnectionFactory(
                redisProperties.getHost(),
                redisProperties.getPort()
        );
    }
    /**
     * RedisTemplate Bean 정의
     * - Redis에 저장할 Key/Value, Hash 구조에 대해 직렬화 방식을 명시적으로 설정합니다.
     * - 기본 RedisTemplate은 Jdk 직렬화를 사용하여 바이너리로 저장되므로
     *   언어 간 호환성, 가독성, 유지보수 측면에서 불리합니다.
     * - 이 설정은 JSON 직렬화를 사용하여 사람이 읽을 수 있는 형식으로 저장되도록 합니다.
     */
    @Bean
    public RedisTemplate<String, Object> redisTemplate(ObjectMapper objectMapper, RedisConnectionFactory redisConnectionFactory) {
        RedisTemplate<String, Object> template = new RedisTemplate<>();

        // Redis 연결 정보 설정
        template.setConnectionFactory(redisConnectionFactory);

        // Redis Key를 UTF-8 문자열(String)로 직렬화
        // → 예: "chart:KRW-BTC:1m" 형태로 키가 저장되며, CLI에서도 사람이 읽을 수 있음
        template.setKeySerializer(new StringRedisSerializer());

        // Value 직렬화기: 다형성 지원 JSON 직렬화기
        GenericJackson2JsonRedisSerializer valueSerializer = new GenericJackson2JsonRedisSerializer(objectMapper);
        template.setValueSerializer(valueSerializer);

        // Hash Key도 문자열로 저장
        // → 예: hash key로 "latest" 또는 "open" 같은 키 사용 가능
        template.setHashKeySerializer(new StringRedisSerializer());

        // Hash Value 직렬화기
        template.setHashValueSerializer(valueSerializer);

        // RedisTemplate 초기화
        // - 모든 설정이 완료된 후 내부 구성 요소를 초기화하는 필수 호출
        template.afterPropertiesSet();

        return template;
    }
}
