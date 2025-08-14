
"""
app/service/orchestrator.py
- 유스케이스 오케스트레이션을 담당합니다.
- 흐름: (1) 마켓 수집 -> (2) 각 마켓의 모든 TF 로딩 -> (3) 각 전략 MTF 판단 -> (4) BUY/SELL만 발행
- 핵심 목표: "마켓 × 전략" 당 최대 1건 발행. (TF 별 다건 발행 금지)
"""
from typing import List
from redis import Redis
from ..schema.models import StrategyResult, Signal, Decision
from .redis_repo import ChartRedisRepository
from ..stratege.registry import get_all_strategies
from .publisher_port import SignalPublisherPort

class Orchestrator:
    def __init__(self, redis_client: Redis, publisher: SignalPublisherPort):
        self.repo = ChartRedisRepository(redis_client)
        self.publisher = publisher
        self.strategies = get_all_strategies()

    def handle_sync_completed(self) -> List[Signal]:
        """
        동기화 완료 이벤트 처리
        - 각 마켓에 대해 모든 타임프레임 데이터를 로딩하고,
        - 각 전략의 evaluate_mtf(...) 를 호출하여 단일 결론을 만든 뒤,
        - BUY/SELL 일 때만 1건 발행합니다.
        """
        out: List[Signal] = []
        markets = self.repo.list_markets()
        for market in markets:
            data_by_unit = self.repo.load_all_units(market)  # {unit: [Candle,...]}
            if not data_by_unit:
                continue
            for strategy in self.strategies:
                r: StrategyResult = strategy.evaluate_mtf(market, data_by_unit)
                if r.decision in (Decision.BUY, Decision.SELL):
                    sig = Signal(strategy=r.strategy_name, market=r.market, unit=r.unit, decision=r.decision)
                    self.publisher.publish(sig)
                    out.append(sig)
        return out
