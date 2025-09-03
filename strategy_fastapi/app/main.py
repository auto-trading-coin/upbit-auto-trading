"""
app/main.py
- FastAPI 앱 구성
- 라우터 포함 및 실행 설정
"""
import logging
from fastapi import FastAPI
from contextlib import asynccontextmanager
from app.core.settings import settings
from app.core.dependencies import get_redis_client, cleanup_singletons
from app.api.routes import router as main_router

logger = logging.getLogger(__name__)
logging.basicConfig(
    level=getattr(logging, settings.log_level.upper()),
    format="%(asctime)s [%(levelname)s] %(name)s - %(message)s"
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: 인프라 연결 검증 (객체는 생성하지 않음)
    try:
        from redis import Redis
        from confluent_kafka import Producer
        
        # Redis 연결 검증
        redis_test = Redis.from_url(settings.redis_url)
        redis_test.ping()
        redis_test.close()
        logger.info("[Startup] Redis 연결 검증 성공")
        
        # Kafka Producer 연결 검증
        kafka_test = Producer({
            'bootstrap.servers': settings.kafka_bootstrap_servers,
            'client.id': f"{settings.app_name}-validation"
        })
        kafka_test.flush(timeout=1.0)
        logger.info("[Startup] Kafka Producer 연결 검증 성공")
        
        logger.info("[Startup] 모든 인프라 연결 검증 완료")
        
    except Exception as e:
        logger.error(f"[Startup] 인프라 연결 실패: {e}")
        raise RuntimeError(f"인프라 연결 실패: {e}")
    
    yield
    
    # Shutdown: 싱글톤 정리
    logger.info("[Shutdown] 싱글톤 정리 시작")
    cleanup_singletons()
    logger.info("[Shutdown] 싱글톤 정리 완료")

app = FastAPI(title=settings.app_name, lifespan=lifespan)

app.include_router(main_router)
