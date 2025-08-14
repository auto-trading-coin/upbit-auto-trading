
"""
app/script/run_once.py
- 카프카 없이 전체 파이프라인을 1회 실행하는 CLI 스크립트입니다.
- 개발자가 Redis 데이터를 준비한 뒤 빠르게 동작 확인/로깅에 사용할 수 있습니다.
"""
from redis import Redis
from ..core.settings import settings
from ..service.orchestrator import Orchestrator
from ..service.dummy_publisher import DummyPublisher

def main():
    r = Redis.from_url(settings.redis_url)
    pub = DummyPublisher()
    orch = Orchestrator(r, pub)
    signals = orch.handle_sync_completed()
    print(f"Signals emitted: {len(signals)}")
    for s in signals:
        print(s.model_dump())

if __name__ == "__main__":
    main()
