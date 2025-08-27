"""
app/models/strategy_base.py
- 전략 인터페이스 정의 (단일 책임)
- MTF 전략 판단을 위한 evaluate_mtf 추상 메서드 포함
"""

from typing import Dict, List
from abc import ABC, abstractmethod
from app.schemas.models import Candle, StrategyResult

class Strategy(ABC):
    @abstractmethod
    def evaluate_mtf(self, market: str, data_by_unit: Dict[int, List[Candle]]) -> StrategyResult:
        pass
