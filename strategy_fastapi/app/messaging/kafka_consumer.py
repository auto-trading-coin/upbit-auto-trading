"""
app/services/kafka_consumer.py  
- Kafka 기반 Price Update 컨슈머 구현체
"""
import json
import logging
from typing import Dict, Any
from confluent_kafka import Consumer
from pydantic import ValidationError

from .consumer_port import ConsumerPort
from ..services.orchestrator import Orchestrator
from ..services.signal_service import SignalService
from ..schemas.models import PriceUpdateEvent

logger = logging.getLogger(__name__)


class KafkaConsumerService(ConsumerPort):
    """Kafka price.update 토픽 컨슈머"""
    
    def __init__(
        self,
        orchestrator: Orchestrator,
        signal_service: SignalService,
        bootstrap_servers: str = "localhost:9092",
        topic: str = "price.update", 
        group_id: str = "strategy-service"
    ):
        self.orchestrator = orchestrator
        self.signal_service = signal_service
        self.bootstrap_servers = bootstrap_servers
        self.topic = topic
        self.group_id = group_id
        self.consumer = None
        self._running = False

    def start_consuming(self) -> None:
        """컨슈밍 시작"""
        try:
            config = {
                'bootstrap.servers': self.bootstrap_servers,
                'group.id': self.group_id,
                'auto.offset.reset': 'latest',
                'enable.auto.commit': True
            }
            
            self.consumer = Consumer(config)
            self.consumer.subscribe([self.topic])
            
            self._running = True
            logger.info(f"Started consuming from topic: {self.topic}")
            
            while self._running:
                try:
                    msg = self.consumer.poll(timeout=1.0)
                    if msg is None:
                        continue
                        
                    if msg.error():
                        logger.error(f"Consumer error: {msg.error()}")
                        continue
                        
                    # 메시지 처리
                    message_data = json.loads(msg.value().decode('utf-8'))
                    self._handle_message(message_data)
                    
                except Exception as e:
                    logger.error(f"Error processing message: {e}")
                    
        except KeyboardInterrupt:
            logger.info("Consumer interrupted by user")
        except Exception as e:
            logger.error(f"Consumer error: {e}")
        finally:
            self.stop_consuming()

    def stop_consuming(self) -> None:
        """컨슈밍 중지"""
        self._running = False
        if self.consumer:
            self.consumer.close()
            logger.info(f"Stopped consuming from topic: {self.topic}")

    def _handle_message(self, message_data: Dict[str, Any]) -> None:
        """price.update 토픽 메시지 처리"""
        try:
            event = PriceUpdateEvent(**message_data)
            logger.info(f"Processing price update for market: {event.market} (eventId: {event.eventId})")
            
            # 전략 실행
            results = self.orchestrator.run_for_market(event.market)
            
            # 신호 발행  
            emitted = self.signal_service.publish_from_results(results)
            
            logger.info(f"Market {event.market}: {len(emitted)} signals emitted")
            
        except ValidationError as e:
            logger.error(f"Invalid message format: {e}")
            logger.error(f"Message: {message_data}")
        except Exception as e:
            logger.error(f"Error processing price update: {e}")
            logger.error(f"Message: {message_data}")