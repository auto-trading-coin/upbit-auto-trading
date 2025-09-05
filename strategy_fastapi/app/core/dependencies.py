"""
app/core/dependencies.py
- 의존성 주입 팩토리 함수 정의
- FastAPI의 Depends()에서 사용
- 모듈 레벨 싱글톤 패턴 적용 (Spring @Component 스타일)
"""

from typing import List, Optional
from confluent_kafka import Producer
from fastapi import Depends
from redis import Redis

from app.core.settings import settings
from app.repositories.redis_chart import ChartRedisRepository
from app.messaging.kafka_signal import KafkaSignalProducer
from app.models.registry import get_registered_strategies
from app.services.orchestrator import Orchestrator
from app.services.signal_service import SignalService
from app.messaging.kafka_consumer import KafkaConsumerService
from app.messaging.producer_port import SignalProducerPort
from app.models.strategy_base import Strategy

# =============================================================================
# Module-level Singletons (Spring @Component 스타일)
# =============================================================================

# 모듈 레벨 전역 변수 (싱글톤 인스턴스)
_redis_client: Optional[Redis] = None
_kafka_producer: Optional[Producer] = None

def _create_redis_client() -> Redis:
    """Redis 클라이언트 생성 (내부 함수)"""
    return Redis.from_url(settings.redis_url)

def _create_kafka_producer() -> Producer:
    """Kafka Producer 생성 (내부 함수)"""
    return Producer({
        "bootstrap.servers": settings.kafka_bootstrap_servers,
        "client.id": settings.app_name,
        "acks": "1",
        "retries": 3,
    })

# =============================================================================
# Infrastructure Layer Dependencies (Singleton)
# =============================================================================

def get_redis_client() -> Redis:
    """Redis 클라이언트 싱글톤"""
    global _redis_client
    if _redis_client is None:
        _redis_client = _create_redis_client()
    return _redis_client

def get_kafka_producer() -> Producer:
    """Kafka Producer 싱글톤"""
    global _kafka_producer
    if _kafka_producer is None:
        _kafka_producer = _create_kafka_producer()
    return _kafka_producer

# =============================================================================
# Repository Layer Dependencies (Infrastructure 의존)
# =============================================================================

def get_chart_repository(
    redis_client: Redis = Depends(get_redis_client)
) -> ChartRedisRepository:
    """차트 데이터 레포지토리"""
    return ChartRedisRepository(
        redis_client=redis_client,
        scan_count=settings.redis_scan_count
    )

# =============================================================================
# Publisher Layer Dependencies (Infrastructure 의존)
# =============================================================================

def get_signal_producer(
    producer: Producer = Depends(get_kafka_producer)
) -> SignalProducerPort:
    """시그널 생산자"""
    return KafkaSignalProducer(
        producer=producer, 
        topic=settings.kafka_signal_topic
    )

# =============================================================================
# Domain Layer Dependencies (상태가 없는 도메인 객체들)
# =============================================================================

def get_all_strategies() -> List[Strategy]:
    """등록된 모든 전략 목록"""
    return get_registered_strategies()

# =============================================================================
# Service Layer Dependencies (최상위 계층 - 다른 모든 계층 의존)
# =============================================================================

def get_orchestrator(
    repository: ChartRedisRepository = Depends(get_chart_repository),
    strategies: List[Strategy] = Depends(get_all_strategies),
) -> Orchestrator:
    """전략 실행 오케스트레이터"""
    return Orchestrator(repository=repository, strategies=strategies)

def get_signal_service(
    producer: SignalProducerPort = Depends(get_signal_producer),
) -> SignalService:
    """시그널 발행 서비스"""
    return SignalService(producer=producer)

def get_kafka_consumer_service(
    orchestrator: Orchestrator = Depends(get_orchestrator),
    signal_service: SignalService = Depends(get_signal_service),
) -> KafkaConsumerService:
    """카프카 컨슈머 서비스"""
    return KafkaConsumerService(
        orchestrator=orchestrator,
        signal_service=signal_service,
        bootstrap_servers=settings.kafka_bootstrap_servers,
        topic="price.update",
        group_id="strategy-service"
    )

# =============================================================================
# Cleanup Functions (애플리케이션 종료 시 사용)
# =============================================================================

def cleanup_singletons():
    """싱글톤 인스턴스 정리"""
    global _redis_client, _kafka_producer
    
    if _redis_client:
        try:
            _redis_client.close()
        except Exception:
            pass
        finally:
            _redis_client = None
    
    if _kafka_producer:
        try:
            _kafka_producer.flush()
            _kafka_producer.close()
        except Exception:
            pass
        finally:
            _kafka_producer = None
