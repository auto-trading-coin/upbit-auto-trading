
"""
app/service/dummy_publisher.py
- 개발/테스트용 퍼블리셔 구현입니다.
- 발행 이력을 메모리에 보관하여 테스트에서 쉽게 검증할 수 있게 합니다.
"""
from typing import List
from ..schema.models import Signal
from .publisher_port import SignalPublisherPort

class DummyPublisher(SignalPublisherPort):
    def __init__(self):
        self.published: List[Signal] = []

    def publish(self, signal: Signal) -> None:
        self.published.append(signal)
