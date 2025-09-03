"""
scripts/run_consumer.py
- Kafka 컨슈머를 실행하는 스크립트
"""
import logging
from app.core.dependencies import get_kafka_consumer_service

# 로깅 설정
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def main():
    """Kafka 컨슈머를 시작합니다."""
    try:
        logger.info("Starting Kafka consumer service...")
        
        # 의존성 주입으로 컨슈머 서비스 생성
        consumer_service = get_kafka_consumer_service()
        
        # 컨슈밍 시작 (블로킹 작업)
        consumer_service.start_consuming()
        
    except KeyboardInterrupt:
        logger.info("Consumer service interrupted by user")
    except Exception as e:
        logger.error(f"Error starting consumer service: {e}")
        raise


if __name__ == "__main__":
    main()