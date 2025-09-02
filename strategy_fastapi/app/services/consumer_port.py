"""
app/services/consumer_port.py
- 카프카 컨슈머 인터페이스 정의 (Port)
"""
from abc import ABC, abstractmethod


class ConsumerPort(ABC):
    """카프카 컨슈머 인터페이스"""
    
    @abstractmethod
    def start_consuming(self) -> None:
        """컨슈밍 시작"""
        pass
    
    @abstractmethod
    def stop_consuming(self) -> None:
        """컨슈밍 중지"""
        pass