"""
app/models/registry.py
- 활성화된 전략 인스턴스 모음 제공
- 모듈 레벨 싱글톤 패턴 적용
- 서비스 계층에서 호출하여 사용
"""

from typing import List
from app.models.strategy_base import Strategy
from app.strategies.rsi_threshold import RSIThreshold
from app.strategies.ema_cross import EMACross
from app.strategies.three_soldiers_trend import ThreeSoldiersTrend

# =============================================================================
# Module-level Singleton Instances
# =============================================================================

_strategies: List[Strategy] = [
    RSIThreshold(strategy_id=1, oversold=30.0, overbought=70.0),
    EMACross(strategy_id=2, fast=9, slow=21),
    ThreeSoldiersTrend(strategy_id=3, ma1_length=30, ma2_length=200,
                       cooldown_period=0, use_cooldown=True),
]

def get_registered_strategies() -> List[Strategy]:
    """등록된 모든 전략 인스턴스 반환 (싱글톤)"""
    return _strategies
