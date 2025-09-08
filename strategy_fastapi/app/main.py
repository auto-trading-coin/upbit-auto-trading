"""
app/main.py
- FastAPI 앱 구성
- 라우터 포함 및 실행 설정
"""
import logging
import asyncio
from fastapi import FastAPI
from contextlib import asynccontextmanager
from app.core.settings import settings
from app.core.dependencies import get_redis_client, cleanup_singletons, create_kafka_consumer_service_for_lifespan
from app.api.routes import router as main_router

logger = logging.getLogger(__name__)
logging.basicConfig(
    level=getattr(logging, settings.log_level.upper()),
    format="%(asctime)s [%(levelname)s] %(name)s - %(message)s"
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: 인프라 연결 검증 및 컨슈머 시작
    consumer_service = None
    consumer_task = None
    
    try:
        from redis import Redis
        from confluent_kafka import Producer
        
        # Redis 연결 검증
        redis_test = get_redis_client()
        redis_test.ping()
        redis_test.close()
        logger.info("[Startup] Redis 연결 검증 성공")
        
        # Kafka Producer 연결 검증
        kafka_test = Producer({
            'bootstrap.servers': settings.kafka_bootstrap_servers,
            'client.id': f"{settings.app_name}-validation"
        })
        kafka_test.flush(timeout=1.0)

        # 메타데이터 요청 (timeout = 5초)
        metadata = kafka_test.list_topics(timeout=5)

        brokers = ", ".join([f"{b.host}:{b.port}" for b in metadata.brokers.values()])
        logger.info("[Startup] Kafka Producer 연결 검증 성공")
        logger.info(f"[Startup] 연결된 Kafka 브로커: {brokers}")

        # 토픽 목록도 원하면 출력
        topics = ", ".join(metadata.topics.keys())
        logger.info(f"[Startup] 사용 가능한 토픽: {topics}")
        
        logger.info("[Startup] 모든 인프라 연결 검증 완료")
        
        # Kafka 컨슈머 백그라운드 태스크 시작
        # lifespan에서는 Depends()가 작동하지 않으므로 별도 함수 사용
        consumer_service = create_kafka_consumer_service_for_lifespan()
        
        # 백그라운드에서 비동기 컨슈머 실행
        consumer_task = asyncio.create_task(
            consumer_service.start_consuming()
        )
        logger.info("[Startup] Kafka 컨슈머 백그라운드 태스크 시작")
        
    except Exception as e:
        logger.error(f"[Startup] 인프라 연결 실패: {e}")
        raise RuntimeError(f"인프라 연결 실패: {e}")
    
    yield
    
    # Shutdown: 컨슈머 및 싱글톤 정리
    logger.info("[Shutdown] Kafka 컨슈머 중지 시작")
    
    if consumer_service:
        # 컨슈머 중지 신호
        consumer_service._running = False
        logger.info("[Shutdown] 컨슈머 중지 신호 발송")
        
        # 컨슈머가 깔끔하게 종료될 시간 제공
        if consumer_task and not consumer_task.done():
            try:
                await asyncio.wait_for(consumer_task, timeout=5.0)
                logger.info("[Shutdown] 컨슈머 태스크 정상 종료")
            except asyncio.TimeoutError:
                logger.warning("[Shutdown] 컨슈머 태스크 타임아웃, 강제 취소")
                consumer_task.cancel()
                try:
                    await consumer_task
                except asyncio.CancelledError:
                    logger.info("[Shutdown] 컨슈머 태스크 취소 완료")
    
    logger.info("[Shutdown] 싱글톤 정리 시작")
    cleanup_singletons()
    logger.info("[Shutdown] 모든 정리 완료")

app = FastAPI(title=settings.app_name, lifespan=lifespan)

app.include_router(main_router)
