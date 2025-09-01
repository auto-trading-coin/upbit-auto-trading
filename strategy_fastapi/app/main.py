"""
app/main.py
- FastAPI 앱 구성
- 라우터 포함 및 실행 설정
"""
import logging
from fastapi import FastAPI
from contextlib import asynccontextmanager
from app.core.settings import settings
from app.repositories.redis_chart import ChartRedisRepository
from app.api.routes import router as main_router

logger = logging.getLogger(__name__)
logging.basicConfig(
    level=getattr(logging, settings.log_level.upper()),
    format="%(asctime)s [%(levelname)s] %(name)s - %(message)s"
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Redis 연결 준비
    repo = ChartRedisRepository()
    try:
        repo.redis.ping()  # 연결 확인
        logger.info(f"[Startup] Redis 연결 성공: {repo.redis}")
    except Exception as e:
        logger.error(f"[Startup] Redis 연결 실패: {e}")
        raise RuntimeError(f"Redis 연결 실패: {e}")
    app.state.redis_repo = repo
    yield
    # 종료시 정리
    try:
        app.state.redis_repo.redis.close()
    except Exception:
        pass

app = FastAPI(title=settings.app_name, lifespan=lifespan)

app.include_router(main_router)
