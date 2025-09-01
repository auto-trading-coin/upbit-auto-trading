"""
app/core/dependencies.py
- 의존성 주입 팩토리 함수 정의
- FastAPI의 Depends()에서 사용
- 완전한 의존성 주입 통일화
"""

from typing import List
from confluent_kafka import Producer
from fastapi import Depends
from redis import Redis

from app.core.settings import settings
from app.repositories.redis_chart import ChartRedisRepository
from app.publishers.kafka_signal import KafkaSignalPublisher
from app.models.registry import get_registered_strategies
from app.services.orchestrator import Orchestrator
from app.services.signal_service import SignalService
from app.publishers.port import SignalPublisherPort
from app.models.strategy_base import Strategy

# =============================================================================
# Infrastructure Layer Dependencies (가장 하위 계층)
# =============================================================================

def get_redis_client() -> Redis:
    """Redis 클라이언트 생성"""
    return Redis.from_url(settings.redis_url)

def get_kafka_producer() -> Producer:
    """Kafka Producer 생성"""
    return Producer({
        "bootstrap.servers": settings.kafka_bootstrap_servers,
        "client.id": settings.app_name,
    })

# =============================================================================
# Repository Layer Dependencies (Infrastructure 의존)
# =============================================================================

def get_chart_repository( redis_client: Redis = Depends(get_redis_client)) -> ChartRedisRepository:
    """차트 데이터 레포지토리"""
    return ChartRedisRepository(
        redis_client=redis_client,
        scan_count=settings.redis_scan_count
    )

# =============================================================================
# Publisher Layer Dependencies (Infrastructure 의존)
# =============================================================================

def get_signal_publisher( producer: Producer = Depends(get_kafka_producer) ) -> SignalPublisherPort:
    """시그널 발행자"""
    return KafkaSignalPublisher(
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
    publisher: SignalPublisherPort = Depends(get_signal_publisher),
) -> SignalService:
    """시그널 발행 서비스"""
    return SignalService(publisher=publisher)
