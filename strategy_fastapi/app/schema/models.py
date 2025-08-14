
"""
app/schema/models.py
- Pydantic 스키마를 정의합니다.
- Upbit JSON 필드명을 Candle 에 그대로 사용합니다. (가독성/유지보수성)
"""
from enum import Enum
from typing import Optional
from pydantic import BaseModel

class Decision(str, Enum):
    BUY = "BUY"
    SELL = "SELL"
    HOLD = "HOLD"

class Candle(BaseModel):
    # Upbit 원본 필드
    id: Optional[int] = None
    market: Optional[str] = None
    candle_date_time_kst: str
    opening_price: float
    high_price: float
    low_price: float
    trade_price: float  # 종가
    timestamp: Optional[int] = None
    candle_acc_trade_price: Optional[float] = None
    candle_acc_trade_volume: float
    unit: Optional[int] = None

class StrategyResult(BaseModel):
    strategy_name: str
    market: str
    unit: int  # 대표 표기용(예: 최저 TF)
    decision: Decision

class Signal(BaseModel):
    # 카프카 전송 페이로드 (시장가 주문 가정으로 가격정보 제외)
    strategy: str
    market: str
    unit: int
    decision: Decision

class SyncCompleted(BaseModel):
    # 카프카 메타데이터(옵션)
    meta_id: Optional[str] = None
    meta_time: Optional[str] = None
