
"""
app/stratege/registry.py
- 활성화할 전략 목록을 정의합니다.
- 환경변수/설정파일로 외부화 가능하며, 여기서는 하드코딩 예시를 제공합니다.
"""
from typing import List
from .rsi_threshold import RSIThreshold
from .ema_cross import EMACross
from ..models.strategy_base import Strategy

def get_all_strategies() -> List[Strategy]:
    return [
        RSIThreshold(oversold=30.0, overbought=70.0),
        EMACross(fast=9, slow=21),
    ]
