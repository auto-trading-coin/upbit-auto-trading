"""
scripts/run_consumer.py
- Kafka 컨슈머를 비동기 방식으로 실행하는 스크립트
"""
import logging
import asyncio
from app.core.dependencies import get_kafka_consumer_service

# 로깅 설정
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


async def main():
    """Kafka 컨슈머를 시작합니다 (비동기 방식)."""
    try:
        logger.info("Starting Kafka consumer service (async)...")
        
        # 의존성 주입으로 컨슈머 서비스 생성
        consumer_service = get_kafka_consumer_service()
        
        # 비동기 컨슈밍 시작
        await consumer_service.start_consuming()
        
    except KeyboardInterrupt:
        logger.info("Consumer service interrupted by user")
    except Exception as e:
        logger.error(f"Error starting consumer service: {e}")
        raise


if __name__ == "__main__":
    asyncio.run(main())