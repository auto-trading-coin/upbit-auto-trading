package com.autric.upbit.external.kafka.consumer;

import com.autric.upbit.external.kafka.dto.SignalMessage;
import com.autric.upbit.external.upbit.service.UpbitSignalExecutionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class KafkaConsumer {

    private final UpbitSignalExecutionService upbitSignalExecutionService;
    @KafkaListener(
            topics = "signal.out",
            groupId = "${spring.kafka.consumer.group-id}",
            containerFactory = "kafkaListenerContainerFactory"
    )
    public void consumer(SignalMessage msg){
        if (msg == null) {
            return;
        }
        log.info("[Kafka] 시그널 메세지 소비");
        log.info("전략 ID :" + msg.getStrategy() + ", 타겟 코인 :" + msg.getMarket() + ", 거래 유형: " + msg.getSide());
        upbitSignalExecutionService.signalExecution(msg);
    }
}
