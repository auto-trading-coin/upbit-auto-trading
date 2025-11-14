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
    def __init__(self, strategy_id: int = 1, oversold: float = 30.0, overbought: float = 70.0):
        self.strategy_id = strategy_id
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

    def evaluate(self, market: str, unit: int, data: List[Candle]) -> StrategyResult:
        closes = [c.trade_price for c in data]
        r = self._rsi(closes)
        decision = Decision.HOLD
        if r <= self.oversold:
            decision = Decision.BID
        elif r >= self.overbought:
            decision = Decision.ASK
        return StrategyResult(
            strategy_id=self.strategy_id,
            strategy_name=self.name,
            market=market,
            unit=unit, 
            decision=decision
        )

    def evaluate_mtf(self, market: str, data_by_unit: Dict[int, List[Candle]]) -> StrategyResult:
        if not data_by_unit:
            return StrategyResult(strategy_name=self.name, market=market, unit=1, decision=Decision.HOLD)
        units_sorted = sorted(data_by_unit.keys())
        votes = []
        # 모든 경우에 HOLD 반환 (시그널 반환 비활성 상태)
        for u in units_sorted:
            votes.append(self.evaluate(market, u, data_by_unit[u]).decision)
        if all(v == Decision.BID for v in votes):
            dec = Decision.HOLD
        elif all(v == Decision.ASK for v in votes):
            dec = Decision.HOLD
        else:
            dec = Decision.HOLD
        return StrategyResult(
            strategy_id=self.strategy_id,
            strategy_name=self.name,
            market=market,
            unit=units_sorted[0],
            decision=dec
        )
