"""
app/publishers/port.py
- 시그널 발행용 포트 인터페이스 정의
- 발행 구현체는 이 인터페이스 구현
"""

from abc import ABC, abstractmethod
from app.schemas.models import Signal

class SignalPublisherPort(ABC):
    @abstractmethod
    def publish(self, signal: Signal) -> None:
        pass
