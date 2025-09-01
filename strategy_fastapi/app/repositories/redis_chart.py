"""
app/repositories/redis_chart.py
- Redis 기반 차트 데이터 조회
- chart:{market}:{unit} 형태의 키 로딩 담당
- Redis 클라이언트를 의존성으로 주입받음
"""

import json
from typing import Dict, List
from redis import Redis
from app.schemas.models import Candle

class ChartRedisRepository:
    def __init__(self, redis_client: Redis, scan_count: int = 1000):
        """
        Args:
            redis_client: 주입받은 Redis 클라이언트
            scan_count: 스캔 시 한번에 가져올 키 개수
        """
        self.redis = redis_client
        self.scan_count = scan_count

    def load_all_units(self, market: str) -> Dict[int, List[Candle]]:
        """특정 마켓의 모든 시간단위 차트 데이터 로딩"""
        keys = self.redis.scan_iter(match=f"chart:{market}:*")
        result = {}
        for key in keys:
            unit = int(key.decode().rsplit(":", 1)[1])
            raw = self.redis.lrange(key, 0, -1)
            candles = [Candle(**json.loads(item)) for item in raw]
            result[unit] = sorted(candles, key=lambda c: c.timestamp)
        return result
