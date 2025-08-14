
"""
app/service/redis_repo.py
- Redis 접근(스캔/로딩)을 담당하는 리포지토리 계층입니다.
- 상위 계층(오케스트레이터/전략)은 Redis 라이브러리 세부를 몰라도 됩니다.
- 키 스키마: chart:{market}:{unit}
"""
from typing import Iterator, Tuple, List, Dict, Set
from redis import Redis
from ..core.settings import settings
from ..core.parsing import parse_chart_key, parse_redis_candle_list
from ..schema.models import Candle

class ChartRedisRepository:
    def __init__(self, client: Redis):
        self.client = client
        self.scan_count = settings.redis_scan_count

    def scan_all_keys(self) -> Iterator[Tuple[str, int]]:
        """chart:*:* 키 전체를 스캔하여 (market, unit) 튜플 스트림을 반환"""
        cursor = 0
        pattern = "chart:*:*"
        while True:
            cursor, keys = self.client.scan(cursor=cursor, match=pattern, count=self.scan_count)
            for k in keys:
                key = k.decode("utf-8") if isinstance(k, (bytes, bytearray)) else str(k)
                try:
                    yield parse_chart_key(key)
                except Exception:
                    continue
            if cursor == 0:
                break

    def list_markets(self) -> List[str]:
        """존재하는 마켓 목록 반환"""
        markets: Set[str] = set()
        for m, _ in self.scan_all_keys():
            markets.add(m)
        return sorted(list(markets))

    def list_units_for_market(self, market: str) -> List[int]:
        """특정 마켓의 사용 가능한 단위 목록"""
        units: Set[int] = set()
        cursor = 0
        pattern = f"chart:{market}:*"
        while True:
            cursor, keys = self.client.scan(cursor=cursor, match=pattern, count=self.scan_count)
            for k in keys:
                key = k.decode("utf-8") if isinstance(k, (bytes, bytearray)) else str(k)
                try:
                    _, unit = parse_chart_key(key)
                    units.add(unit)
                except Exception:
                    continue
            if cursor == 0:
                break
        return sorted(list(units))

    def load_candles(self, market: str, unit: int) -> List[Candle]:
        """단일 (market, unit) 의 캔들 리스트 로딩"""
        key = f"chart:{market}:{unit}"
        raw_list = self.client.lrange(key, 0, -1)
        if not raw_list:
            return []
        return parse_redis_candle_list(raw_list)

    def load_all_units(self, market: str) -> Dict[int, List[Candle]]:
        """특정 마켓의 모든 유닛 데이터를 로딩하여 {unit: [Candle,...]} 반환"""
        out: Dict[int, List[Candle]] = {}
        for unit in self.list_units_for_market(market):
            candles = self.load_candles(market, unit)
            if candles:
                out[unit] = candles
        return out
