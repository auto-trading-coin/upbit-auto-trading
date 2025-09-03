"""
app/messaging/kafka_signal.py
- Kafka 기반 SignalPublisher 구현체
- Signal 객체를 JSON으로 직렬화 후 Kafka 토픽에 발행
"""

from app.messaging.publisher_port import SignalPublisherPort
from app.schemas.models import Signal
from confluent_kafka import Producer

class KafkaSignalPublisher(SignalPublisherPort):
    def __init__(self, producer: Producer, topic: str):
        self.producer = producer
        self.topic = topic

    def publish(self, signal: Signal) -> None:
        payload = signal.model_dump_json()
        self.producer.produce(self.topic, payload)
        self.producer.flush()
