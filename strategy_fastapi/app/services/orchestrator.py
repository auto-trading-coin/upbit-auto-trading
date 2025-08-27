"""
app/services/orchestrator.py
- 전략 판단 흐름 조율
- Redis에서 chart 데이터 로딩 → 전략별 판단 수행 → 결과 반환
"""

from typing import List
from app.repositories.redis_chart import ChartRedisRepository
from app.models.strategy_base import Strategy
from app.schemas.models import StrategyResult

class Orchestrator:
    def __init__(self, repository: ChartRedisRepository, strategies: List[Strategy]):
        self.repository = repository
        self.strategies = strategies

    def run_for_market(self, market: str) -> List[StrategyResult]:
        results: List[StrategyResult] = []

        data_by_unit = self.repository.load_all_units(market)
        if not data_by_unit:
            return []

        for strategy in self.strategies:
            result = strategy.evaluate_mtf(market, data_by_unit)
            results.append(result)

        return results
