"""
app/schema/models.py
- Pydantic 스키마 정의
- Upbit 원본 필드 유지 (Candle)
- Kafka 이벤트 및 전략 결과, 시그널 형태 정의
"""

from enum import Enum
from typing import Optional
from pydantic import BaseModel

class Decision(str, Enum):
    BUY = "BUY"
    SELL = "SELL"
    HOLD = "HOLD"

    def is_entry_or_exit(self) -> bool:
        return self in {Decision.BUY, Decision.SELL}

class Candle(BaseModel):
    id: Optional[int] = None
    market: Optional[str] = None
    candle_date_time_kst: str
    opening_price: float
    high_price: float
    low_price: float
    trade_price: float
    timestamp: Optional[int] = None
    candle_acc_trade_price: Optional[float] = None
    candle_acc_trade_volume: float
    unit: Optional[int] = None

class StrategyResult(BaseModel):
    strategy_id: int     # DB PK or UUID
    strategy_name: str   # 사람이 보기 위한 이름
    market: str
    decision: Decision

    def to_signal(self) -> "Signal":
        return Signal(strategy=self.strategy_name, market=self.market, decision=self.decision)

class Signal(BaseModel):
    strategy_id: int     # DB PK or UUID
    strategy_name: str   # 사람이 보기 위한 이름
    market: str
    decision: Decision

class PriceUpdateEvent(BaseModel):
    eventId: str
    ts: str
    market: str
