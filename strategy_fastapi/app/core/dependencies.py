"""
app/core/dependencies.py
- 의존성 주입 팩토리 함수 정의
- FastAPI의 Depends()에서 사용
"""

from typing import List
from confluent_kafka import Producer
from fastapi import Depends

from app.core.settings import settings
from app.repositories.redis_chart import ChartRedisRepository
from app.publishers.kafka_signal import KafkaSignalPublisher
from app.models.registry import get_registered_strategies
from app.services.orchestrator import Orchestrator
from app.services.signal_service import SignalService
from app.publishers.port import SignalPublisherPort
from app.models.strategy_base import Strategy

def get_chart_repository() -> ChartRedisRepository:
    return ChartRedisRepository()

def get_signal_publisher() -> SignalPublisherPort:
    producer = Producer({"bootstrap.servers": settings.kafka_bootstrap_servers})
    return KafkaSignalPublisher(producer, topic=settings.kafka_signal_topic)

def get_all_strategies() -> List[Strategy]:
    return get_registered_strategies()

def get_orchestrator(
        repo: ChartRedisRepository = Depends(get_chart_repository),
        strategies: List[Strategy] = Depends(get_all_strategies),
) -> Orchestrator:
    return Orchestrator(repository=repo, strategies=strategies)

def get_signal_service(
        publisher: SignalPublisherPort = Depends(get_signal_publisher),
) -> SignalService:
    return SignalService(publisher=publisher)
