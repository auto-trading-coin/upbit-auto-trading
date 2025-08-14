
"""
app/stratege/ema_cross.py
- EMA(9/21) 교차 전략 예시.
- evaluate: 단일 TF fast EMA > slow EMA -> BUY, fast < slow -> SELL, else HOLD.
- evaluate_mtf: 모든 TF 판단을 합의 규칙으로 통합 (전부 BUY => BUY, 전부 SELL => SELL, else HOLD).
"""
from typing import List, Optional, Dict
from ..models.strategy_base import Strategy
from ..schema.models import Candle, StrategyResult, Decision

class EMACross(Strategy):
    def __init__(self, fast: int = 9, slow: int = 21):
        self.name = f"EMA({fast}/{slow}) Cross"
        self.fast = fast
        self.slow = slow

    def _ema(self, closes: List[float], period: int) -> Optional[float]:
        if len(closes) < period:
            return None
        k = 2 / (period + 1)
        ema = closes[-period]
        for x in closes[-period + 1:]:
            ema = x * k + ema * (1 - k)
        return ema

    def evaluate(self, market: str, unit: int, candles: List[Candle]) -> StrategyResult:
        closes = [c.trade_price for c in candles]
        f = self._ema(closes, self.fast)
        s = self._ema(closes, self.slow)
        decision = Decision.HOLD
        if f is not None and s is not None:
            if f > s:
                decision = Decision.BUY
            elif f < s:
                decision = Decision.SELL
        return StrategyResult(strategy_name=self.name, market=market, unit=unit, decision=decision)

    def evaluate_mtf(self, market: str, data_by_unit: Dict[int, List[Candle]]) -> StrategyResult:
        if not data_by_unit:
            return StrategyResult(strategy_name=self.name, market=market, unit=1, decision=Decision.HOLD)
        units_sorted = sorted(data_by_unit.keys())
        votes = []
        for u in units_sorted:
            votes.append(self.evaluate(market, u, data_by_unit[u]).decision)
        if all(v == Decision.BUY for v in votes):
            dec = Decision.BUY
        elif all(v == Decision.SELL for v in votes):
            dec = Decision.SELL
        else:
            dec = Decision.HOLD
        return StrategyResult(strategy_name=self.name, market=market, unit=units_sorted[0], decision=dec)
