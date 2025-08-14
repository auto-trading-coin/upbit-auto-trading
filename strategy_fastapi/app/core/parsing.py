
"""
app/core/parsing.py
- Redis 키 파싱과 캔들 정규화를 담당합니다.
- 저장은 LPUSH 로 "최신이 0번 인덱스" 이므로 LRANGE 0 -1 이후 list(reversed(...)) 하여
  "과거 -> 현재" 순서로 변환합니다. (TA-Lib 등 보조지표 라이브러리 호환성)
- Upbit 원본 JSON 필드명을 Candle 모델에서 그대로 사용합니다.
"""
import json
import re
from typing import List, Tuple
from ..schema.models import Candle

KEY_PATTERN = re.compile(r"^chart:(?P<market>[A-Z0-9\-]+):(?P<unit>\d+)$")

def parse_chart_key(key: str) -> Tuple[str, int]:
    """chart:{market}:{unit} 형태를 파싱하여 (market, unit) 튜플을 반환합니다."""
    m = KEY_PATTERN.match(key)
    if not m:
        raise ValueError(f"Invalid key: {key}")
    return m.group("market"), int(m.group("unit"))

def parse_redis_candle_list(raw_list: List[bytes]) -> List[Candle]:
    """
    Redis LRANGE 결과(문자열/바이너리 JSON 리스트)를 Upbit 원본 필드로 역직렬화합니다.
    - 불량 레코드는 조용히 스킵합니다.
    - 반환은 '과거 -> 현재' 순서가 되도록 역순 정렬합니다.
    """
    items: List[Candle] = []
    for raw in raw_list:
        s = raw.decode("utf-8") if isinstance(raw, (bytes, bytearray)) else str(raw)
        try:
            obj = json.loads(s)
            items.append(Candle(**obj))
        except Exception:
            continue
    return list(reversed(items))
