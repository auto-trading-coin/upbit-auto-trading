"""
app/schema/models.py
- Pydantic 스키마 정의
- Upbit 원본 필드 유지 (Candle)
- Kafka 이벤트 및 전략 결과, 시그널 형태 정의
- 메인서버 SignalMessage DTO와 호환
"""

from enum import Enum
from typing import Optional
from datetime import datetime
from zoneinfo import ZoneInfo
from pydantic import BaseModel, Field

class Decision(str, Enum):
    BID = "BID"
    ASK = "ASK"
    HOLD = "HOLD"

    def to_side(self) -> Optional[str]:
        """Java SignalMessage의 side 필드로 변환"""
        if self == Decision.BID:
            return "bid"
        elif self == Decision.ASK:
            return "ask"  # 또는 "매도" - 메인서버 요구사항에 따라
        else:
            return None  # HOLD는 신호를 보내지 않음

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
    timestamp: datetime = Field(default_factory=lambda: datetime.now(ZoneInfo("Asia/Seoul")))

    def to_signal(self) -> Optional["Signal"]:
        """메인서버 SignalMessage 형식으로 변환 (KST 시간대 사용)"""
        return Signal(
            market=self.market,
            strategy=self.strategy_id,
            side=self.decision.to_side(),
            timestamp=self.timestamp
        )

class Signal(BaseModel):
    """메인서버 SignalMessage DTO와 호환되는 신호 클래스"""
    market: str                    # 시장 이름 (ex. KRW-BTC)
    strategy: Optional[int] = None # 전략 ID (ex. 1) - Java Long -> Python int
    side: str                      # 신호 매수/매도 종류 (bid / ask)
    timestamp: datetime            # 시그널 생성 시각 (KST 기준)


    def model_dump(self, **kwargs):
        """JSON 직렬화용 딕셔너리 반환 (Pydantic v2 호환)"""
        data = super().model_dump(**kwargs)
        # timestamp를 ISO 8601 형식으로 변환 (시간대 정보 포함)
        if isinstance(data.get('timestamp'), datetime):
            data['timestamp'] = data['timestamp'].isoformat()
        return data

    def dict(self, **kwargs):
        """하위 호환성을 위한 dict 메서드"""
        return self.model_dump(**kwargs)

class PriceUpdateEvent(BaseModel):
    eventId: str
    ts: str  # ISO 8601 timestamp
    market: str
