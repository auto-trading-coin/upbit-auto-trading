"""
app/strategies/rsi_threshold.py
- RSI 임계값 전략 예시.
- evaluate: 단일 TF RSI 로 BUY/SELL/HOLD 판단.
- evaluate_mtf: 모든 TF의 판단을 모아 "전부 BUY면 BUY, 전부 SELL이면 SELL, 아니면 HOLD" 합의 규칙.
"""
from typing import List, Dict
from ..models.strategy_base import Strategy
from ..schemas.models import Candle, StrategyResult, Decision

class RSIThreshold(Strategy):
    def __init__(self, oversold: float = 30.0, overbought: float = 70.0):
        self.name = f"RSI({oversold}/{overbought})"
        self.oversold = oversold
        self.overbought = overbought

    def _rsi(self, closes: List[float], period: int = 14) -> float:
        if len(closes) < period + 1:
            return 50.0
        gains = []
        losses = []
        for i in range(-period, 0):
            diff = closes[i] - closes[i - 1]
            if diff >= 0:
                gains.append(diff)
                losses.append(0.0)
            else:
                gains.append(0.0)
                losses.append(-diff)
        avg_gain = sum(gains) / period
        avg_loss = sum(losses) / period
        if avg_loss == 0:
            return 100.0
        rs = avg_gain / avg_loss
        return 100.0 - (100.0 / (1.0 + rs))

    def evaluate(self, market: str, unit: int, candles: List[Candle]) -> StrategyResult:
        closes = [c.trade_price for c in candles]
        r = self._rsi(closes)
        decision = Decision.HOLD
        if r <= self.oversold:
            decision = Decision.BUY
        elif r >= self.overbought:
            decision = Decision.SELL
        return StrategyResult(strategy_name=self.name, market=market, unit=unit, decision=decision)

    def evaluate_mtf(self, market: str, data_by_unit: Dict[int, List[Candle]]) -> StrategyResult:
        """
        MTF 합의 규칙:
        - 각 TF의 evaluate 결과를 모아 모두 BUY면 BUY, 모두 SELL이면 SELL, 그 외 HOLD
        - 대표 unit 은 가장 낮은 TF 로 표기(응답 형식 통일 목적)
        """
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
