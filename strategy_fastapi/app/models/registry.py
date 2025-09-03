"""
app/models/registry.py
- 활성화된 전략 인스턴스 모음 제공
- 서비스 계층에서 호출하여 사용
"""

from typing import List
from app.models.strategy_base import Strategy
# 예시 전략 클래스 import (구체 전략 구현 필요)
from app.strategies.rsi_threshold import RSIThreshold
from app.strategies.ema_cross import EMACross

def get_registered_strategies() -> List[Strategy]:
    """등록된 모든 전략 인스턴스 반환"""
    return [
        RSIThreshold(strategy_id=1, oversold=30.0, overbought=70.0),
        EMACross(strategy_id=2, fast=9, slow=21),
    ]
