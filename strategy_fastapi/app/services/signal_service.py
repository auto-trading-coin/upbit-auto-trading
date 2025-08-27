"""
app/services/signal_service.py
- StrategyResult 기반 시그널 생성 및 발행 처리
- BUY/SELL 판단 결과만 발행
"""

from typing import List
from app.schemas.models import StrategyResult, Signal
from app.publishers.port import SignalPublisherPort

class SignalService:
    def __init__(self, publisher: SignalPublisherPort):
        self.publisher = publisher

    def publish_from_results(self, results: List[StrategyResult]) -> List[Signal]:
        emitted: List[Signal] = []

        for result in results:
            if result.decision.is_entry_or_exit():
                signal = result.to_signal()
                self.publisher.publish(signal)
                emitted.append(signal)

        return emitted
