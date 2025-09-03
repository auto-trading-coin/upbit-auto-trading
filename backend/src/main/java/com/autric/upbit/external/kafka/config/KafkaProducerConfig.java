package com.autric.upbit.external.kafka.config;

import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.common.serialization.StringSerializer;
import org.springframework.kafka.core.DefaultKafkaProducerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.serializer.JsonSerializer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.core.ProducerFactory;
import java.util.HashMap;
import java.util.Map;


@Configuration
public class KafkaProducerConfig {

    @Value("${spring.kafka.bootstrap-servers}")
    private String kafkaServerIp;

    @Bean
    public ProducerFactory<String, Object> producerFactoryJson(){
        Map<String, Object> config = new HashMap<>();
        // 카프카 브로커 서버
        config.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, kafkaServerIp);
        // 컨슈머 키/값 역직렬화 방식
        config.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class);
        config.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, JsonSerializer.class);
        // 타입 헤더 제거(스프링 전용 타입 정보 헤더를 붙이지 않음)
        config.put(JsonSerializer.ADD_TYPE_INFO_HEADERS, false);

        return new DefaultKafkaProducerFactory<>(config);
    }

    @Bean
    public KafkaTemplate<String, Object> kafkaTemplateJson() {
        return new KafkaTemplate<>(producerFactoryJson());
    }
}
