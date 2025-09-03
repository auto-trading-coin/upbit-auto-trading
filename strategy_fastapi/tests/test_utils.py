"""
app/core/test_utils.py
- 테스트를 위한 싱글톤 Mock 교체 유틸리티
- 테스트 격리 및 Mock 객체 주입 지원
"""

from typing import Optional
from unittest.mock import Mock
from redis import Redis
from confluent_kafka import Producer
import app.core.dependencies as deps

class SingletonTestManager:
    """테스트용 싱글톤 관리자"""
    
    _original_redis: Optional[Redis] = None
    _original_kafka: Optional[Producer] = None
    
    @classmethod
    def mock_redis_client(cls, mock_client: Mock):
        """Redis 클라이언트를 Mock으로 교체"""
        # 원본 백업
        cls._original_redis = deps._redis_client
        # Mock으로 교체
        deps._redis_client = mock_client
    
    @classmethod
    def mock_kafka_producer(cls, mock_producer: Mock):
        """Kafka Producer를 Mock으로 교체"""
        # 원본 백업
        cls._original_kafka = deps._kafka_producer
        # Mock으로 교체
        deps._kafka_producer = mock_producer
    
    @classmethod
    def reset_singletons(cls):
        """싱글톤을 원본 상태로 복원"""
        # 원본 복원
        deps._redis_client = cls._original_redis
        deps._kafka_producer = cls._original_kafka
        
        # 백업 초기화
        cls._original_redis = None
        cls._original_kafka = None
    
    @classmethod
    def clear_singletons(cls):
        """모든 싱글톤 인스턴스 초기화 (테스트 격리)"""
        deps._redis_client = None
        deps._kafka_producer = None

# 테스트 헬퍼 함수들
def setup_test_mocks():
    """테스트용 Mock 객체 설정"""
    mock_redis = Mock(spec=Redis)
    mock_kafka = Mock(spec=Producer)
    
    SingletonTestManager.mock_redis_client(mock_redis)
    SingletonTestManager.mock_kafka_producer(mock_kafka)
    
    return mock_redis, mock_kafka

def cleanup_test_mocks():
    """테스트 후 Mock 정리"""
    SingletonTestManager.reset_singletons()
