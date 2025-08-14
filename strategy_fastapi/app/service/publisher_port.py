
"""
app/service/publisher_port.py
- 시그널 발행을 위한 추상 포트입니다.
- 카프카 연동 시 KafkaPublisher 가 이 인터페이스를 구현하여 publish 를 수행합니다.
"""
from abc import ABC, abstractmethod
from ..schema.models import Signal

class SignalPublisherPort(ABC):
    @abstractmethod
    def publish(self, signal: Signal) -> None:
        """시그널을 외부로 전송"""
        raise NotImplementedError
