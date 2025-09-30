"""
app/services/signal_service.py
- StrategyResult 기반 시그널 생성 및 발행 처리
- BUY/SELL 판단 결과만 발행 (HOLD는 제외)
- 메인서버 SignalMessage 형식으로 발행
"""

from typing import List
from app.schemas.models import StrategyResult, Signal
from app.messaging.producer_port import SignalProducerPort

class SignalService:
    def __init__(self, producer: SignalProducerPort):
        self.producer = producer

    def publish_from_results(self, results: List[StrategyResult]) -> List[Signal]:
        emitted: List[Signal] = []

        for result in results:
            signal = result.to_signal()
            if signal is not None:  # HOLD가 아닌 경우에만 발행
                self.producer.publish(signal)
                emitted.append(signal)

        return emitted
