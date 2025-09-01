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
    # Startup: 싱글톤 인스턴스 초기화 및 연결 확인
    try:
        redis_client = get_redis_client()
        redis_client.ping()  # 연결 확인
        logger.info("[Startup] Redis 싱글톤 연결 성공")
    except Exception as e:
        logger.error(f"[Startup] Redis 연결 실패: {e}")
        raise RuntimeError(f"Redis 연결 실패: {e}")
    
    logger.info("[Startup] 모든 싱글톤 초기화 완료")
    
    yield
    
    # Shutdown: 싱글톤 정리
    logger.info("[Shutdown] 싱글톤 정리 시작")
    cleanup_singletons()
    logger.info("[Shutdown] 싱글톤 정리 완료")

app = FastAPI(title=settings.app_name, lifespan=lifespan)

app.include_router(main_router)
