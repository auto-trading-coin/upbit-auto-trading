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
    BID = "BID"
    ASK = "ASK"
    HOLD = "HOLD"

    def is_entry_or_exit(self) -> bool:
        return self in {Decision.BID, Decision.ASK}

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
    strategy_id: Optional[int] = None  # DB PK or UUID (선택적)
    strategy_name: str   # 사람이 보기 위한 이름
    market: str
    unit: int           # 대표 시간 단위
    decision: Decision

    def to_signal(self) -> "Signal":
        return Signal(
            strategy_id=self.strategy_id,
            strategy_name=self.strategy_name, 
            market=self.market, 
            decision=self.decision
        )

class Signal(BaseModel):
    strategy_id: Optional[int] = None  # DB PK or UUID (선택적)
    strategy_name: str   # 사람이 보기 위한 이름
    market: str
    decision: Decision

    def dict(self, **kwargs):
        data = super().model_dump(**kwargs)
        if self.decision == Decision.HOLD:
            # HOLD인 경우 decision 필드 제거
            data.pop('decision', None)
        else:
            # BID, ASK인 경우 소문자로 변환
            data['decision'] = self.decision.value.lower()
        return data

class PriceUpdateEvent(BaseModel):
    eventId: str
    ts: str
    market: str
