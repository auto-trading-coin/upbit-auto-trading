package com.autric.upbit.external.kafka.consumer;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
public class TestConsumer {

    @KafkaListener(
            topics = "test",
            containerFactory = "kafkaListenerContainerFactoryString" // String 컨슈머 팩토리명
    )
    public void consumerTest(String message){
        System.out.println(message);
    }
}
