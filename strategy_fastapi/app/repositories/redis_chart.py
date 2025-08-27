"""
app/repositories/redis_chart.py
- Redis 기반 차트 데이터 조회
- chart:{market}:{unit} 형태의 키 로딩 담당
"""

import json
from typing import Dict, List
from redis import Redis
from app.schemas.models import Candle

class ChartRedisRepository:
    def __init__(self, redis_client: Redis = None, scan_count: int = 1000):
        self.redis = redis_client or Redis.from_url("redis://localhost:6379/0")
        self.scan_count = scan_count

    def load_all_units(self, market: str) -> Dict[int, List[Candle]]:
        keys = self.redis.scan_iter(match=f"chart:{market}:*")
        result = {}
        for key in keys:
            unit = int(key.decode().rsplit(":", 1)[1])
            raw = self.redis.lrange(key, 0, -1)
            candles = [Candle(**json.loads(item)) for item in raw]
            result[unit] = sorted(candles, key=lambda c: c.timestamp)
        return result
