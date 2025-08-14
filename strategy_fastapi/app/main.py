
"""
app/main.py
- FastAPI 애플리케이션의 진입점입니다.
- 의존성( Redis 클라이언트, 퍼블리셔, 오케스트레이터 )을 생성하여 app.state 에 보관합니다.
- 라우터를 등록하고 /health 를 제공합니다.
- 주의: app.state.* 는 런타임 동적 속성이므로 IDE 경고가 있을 수 있으나 동작에는 문제가 없습니다.
"""
from fastapi import FastAPI
from redis import Redis
from .core.settings import settings
from .service.orchestrator import Orchestrator
from .service.dummy_publisher import DummyPublisher
from .api.routes import router as api_router

# ----- 애플리케이션 생성 -----
app = FastAPI(title="Strategy Server (MTF, Kafka-agnostic, Upbit fields)")

# ----- 인프라 준비 (실서비스에선 DI 프레임워크로 대체 가능) -----
redis_client = Redis.from_url(settings.redis_url)
publisher = DummyPublisher()  # 카프카 연결 시 DummyPublisher -> KafkaPublisher 로 교체
orchestrator = Orchestrator(redis_client, publisher)

# ----- 런타임 DI 컨테이너로서 app.state 사용 -----
app.state.redis = redis_client
app.state.publisher = publisher
app.state.orchestrator = orchestrator

# ----- 헬스체크 -----
@app.get("/health")
def health():
    return {"status": "ok"}

# ----- 라우터 등록 -----
app.include_router(api_router, prefix="")
