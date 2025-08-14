
"""
app/models/strategy_base.py
- 전략 인터페이스(추상 클래스)를 정의합니다.
- 단일 TF 평가 evaluate(...) 와 멀티 TF 평가 evaluate_mtf(...) 를 모두 제공합니다.
- 기본 evaluate_mtf 는 가장 낮은 타임프레임만 사용하도록 위임합니다.
  (전략 구현체가 자유롭게 오버라이드 하여 MTF 로직을 구현)
"""
from abc import ABC, abstractmethod
from typing import List, Dict
from ..schema.models import Candle, StrategyResult, Decision

class Strategy(ABC):
    name: str

    @abstractmethod
    def evaluate(self, market: str, unit: int, candles: List[Candle]) -> StrategyResult:
        """단일 타임프레임 평가"""
        raise NotImplementedError

    def evaluate_mtf(self, market: str, data_by_unit: Dict[int, List[Candle]]) -> StrategyResult:
        """
        멀티 타임프레임 평가 (기본 구현)
        - 가능한 가장 낮은 타임프레임을 대표로 삼아 evaluate 에 위임합니다.
        - 각 전략 구현체에서 오버라이드하여 합의/가중치/컨펌 규칙을 적용할 수 있습니다.
        """
        if not data_by_unit:
            return StrategyResult(strategy_name=self.name, market=market, unit=1, decision=Decision.HOLD)
        units_sorted = sorted(data_by_unit.keys())
        unit = units_sorted[0]
        return self.evaluate(market, unit, data_by_unit[unit])
