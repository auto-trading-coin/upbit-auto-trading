"""
app/main.py
- FastAPI 앱 구성
- 라우터 포함 및 실행 설정
"""
import logging
from fastapi import FastAPI
from contextlib import asynccontextmanager
from app.core.settings import settings
from app.core.dependencies import get_redis_client
from app.api.routes import router as main_router

logger = logging.getLogger(__name__)
logging.basicConfig(
    level=getattr(logging, settings.log_level.upper()),
    format="%(asctime)s [%(levelname)s] %(name)s - %(message)s"
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Redis 연결 확인 (의존성 시스템 사용)
    try:
        redis_client = get_redis_client()
        redis_client.ping()  # 연결 확인
        logger.info(f"[Startup] Redis 연결 성공")
    except Exception as e:
        logger.error(f"[Startup] Redis 연결 실패: {e}")
        raise RuntimeError(f"Redis 연결 실패: {e}")
    
    yield
    
    # 종료시 정리
    try:
        redis_client.close()
        logger.info("[Shutdown] Redis 연결 정리 완료")
    except Exception as e:
        logger.warning(f"[Shutdown] Redis 정리 중 오류: {e}")

app = FastAPI(title=settings.app_name, lifespan=lifespan)

app.include_router(main_router)
