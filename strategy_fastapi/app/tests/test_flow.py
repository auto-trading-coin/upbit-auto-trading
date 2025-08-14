
"""
app/tests/test_flow.py
- fakeredis 로 Redis 를 모킹하여 전체 파이프라인을 검증합니다.
- 시나리오: 두 개 마켓을 생성하고 여러 타임프레임에 캔들을 적재 ->
           orchestrator.handle_sync_completed() 호출 ->
           "마켓 × 전략" 개수 이하로 시그널이 발행되는지 확인합니다.
"""
import json
import fakeredis
from app.service.orchestrator import Orchestrator
from app.service.dummy_publisher import DummyPublisher

def item(t, c, market="KRW-BTC", unit=1, o=100, h=101, l=99, v=10, i=1):
    return json.dumps({
        "id": i, "market": market, "candle_date_time_kst": t,
        "opening_price": o, "high_price": h, "low_price": l,
        "trade_price": c, "timestamp": 0,
        "candle_acc_trade_price": 0.0, "candle_acc_trade_volume": v,
        "unit": unit
    })

def push_series(r, key, closes):
    # 최신이 0번이 되도록 LPUSH 로 역순 삽입
    for idx, c in enumerate(reversed(closes), 1):
        r.lpush(key, item(f"2024-01-01T00:{idx:02d}:00", c))

def test_mtf_one_signal_per_market_and_strategy():
    r = fakeredis.FakeRedis()
    # BTC: 1m, 60m
    push_series(r, "chart:KRW-BTC:1", [100,101,102,103,104,105,106,107,108,109,110])
    push_series(r, "chart:KRW-BTC:60", [200,201,202,203,204,205,206,207,208,209,210])
    # ETH: 1m, 60m
    push_series(r, "chart:KRW-ETH:1", [300,301,302,303,304,305,306,307,308,309,310])
    push_series(r, "chart:KRW-ETH:60", [400,401,402,403,404,405,406,407,408,409,410])

    pub = DummyPublisher()
    orch = Orchestrator(r, pub)
    signals = orch.handle_sync_completed()

    # 활성 전략 2개, 마켓 2개 -> 최대 4건
    assert len(signals) <= 4
    assert len(pub.published) == len(signals)
