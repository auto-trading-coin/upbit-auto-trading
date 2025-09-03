package com.autric.upbit.external.kafka.config;

import com.autric.upbit.external.kafka.dto.PriceUpdateEvent;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.annotation.EnableKafka;
import org.springframework.kafka.config.ConcurrentKafkaListenerContainerFactory;
import org.springframework.kafka.core.ConsumerFactory;
import org.springframework.kafka.core.DefaultKafkaConsumerFactory;
import org.springframework.kafka.support.serializer.JsonDeserializer;

import java.util.HashMap;
import java.util.Map;

@EnableKafka
@Configuration
public class KafkaConsumerConfig {

    @Value("${spring.kafka.bootstrap-servers}")
    private String kafkaServerIp;

    @Value("${spring.kafka.consumer.group-id}")
    private String groupId;

    /**
     * JSON 메시지 컨슈머 설정
     */
    @Bean
    public ConsumerFactory<String, PriceUpdateEvent> consumerFactory() {
        Map<String, Object> config = new HashMap<>();
        config.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, kafkaServerIp);
        config.put(ConsumerConfig.GROUP_ID_CONFIG, groupId);
        config.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);
        config.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, JsonDeserializer.class);

        // 헤더를 보지 않음 + 기본 타입 고정
        config.put(JsonDeserializer.USE_TYPE_INFO_HEADERS, false);

        // 항상 PriceUpdateEvent로 역직렬화
        config.put(JsonDeserializer.VALUE_DEFAULT_TYPE,
                "com.autric.upbit.external.kafka.dto.PriceUpdateEvent");

        // 보안상 역직렬화 허용 패키지 한정
        config.put(JsonDeserializer.TRUSTED_PACKAGES, "com.autric.upbit.external.kafka.dto");
        // 파티션의 가장 처음부터 읽기 시작
        config.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest");
        return new DefaultKafkaConsumerFactory<>(config, new StringDeserializer(), new JsonDeserializer<>(PriceUpdateEvent.class, false));
    }

    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, PriceUpdateEvent> kafkaListenerContainerFactory() {
        ConcurrentKafkaListenerContainerFactory<String, PriceUpdateEvent> factory = new ConcurrentKafkaListenerContainerFactory<>();
        factory.setConsumerFactory(consumerFactory());
        return factory;
    }
}

