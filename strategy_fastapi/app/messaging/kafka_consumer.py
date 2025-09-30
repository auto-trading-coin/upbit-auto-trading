"""
app/services/kafka_consumer.py
- Kafka 기반 Price Update 컨슈머 구현체
"""
import json
import logging
import asyncio
import sys
from typing import Dict, Any
from confluent_kafka import Consumer,KafkaError,KafkaException
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
        bootstrap_servers: str,
        topic: str,
        group_id: str  # 새로운 그룹 ID로 테스트
    ):
        self.orchestrator = orchestrator
        self.signal_service = signal_service
        self.bootstrap_servers = bootstrap_servers
        self.topic = topic
        self.group_id = group_id
        self.consumer = None
        self._running = False

    async def start_consuming(self) -> None:
        """비동기 컨슈밍 시작"""
        try:
            config = {
                'bootstrap.servers': self.bootstrap_servers,
                'group.id': self.group_id,  # 간단한 고정 그룹 ID
                'auto.offset.reset': 'earliest',
                'enable.auto.commit': True
            }

            self.consumer = Consumer(config)
            self.consumer.subscribe([self.topic])

            self._running = True
            logger.info(f"Started async consuming from topic: {self.topic}")
            logger.info(f"Consumer config: {config}")
            logger.info(f"Subscribed to topic: {self.topic}")

            while self._running:
                # logger.info("consumer start")
                msg = self.consumer.poll(timeout=1.0)
                if msg is None:
                    continue

                if msg.error():
                    if msg.error().code() == KafkaError._PARTITION_EOF:
                        # End of partition event
                        sys.stderr.write('%% %s [%d] reached end at offset %d\n' %
                                         (msg.topic(), msg.partition(), msg.offset()))
                    elif msg.error():
                        raise KafkaException(msg.error())
                else:
                    message_data = json.loads(msg.value().decode('utf-8'))
                    await self._handle_message(message_data)

        except Exception as e:
            logger.error(f"Consumer error: {e}")
        finally:
            await self.stop_consuming()

    async def stop_consuming(self) -> None:
        """비동기 컨슈밍 중지"""
        self._running = False
        if self.consumer:
            # executor에서 close 실행 (블로킹일 수 있음)
            current_loop = asyncio.get_running_loop()
            await current_loop.run_in_executor(None, self.consumer.close)

    async def _handle_message(self, message_data: Dict[str, Any]) -> None:
        """price.update 토픽 메시지 처리"""
        try:
            event = PriceUpdateEvent(**message_data)

            # executor에서 동기 작업들을 실행
            current_loop = asyncio.get_running_loop()

            # 전략 실행 (비동기)
            results = await current_loop.run_in_executor(
                None, self.orchestrator.run_for_market, event.market
            )

            # 신호 발행 (비동기)
            emitted = await current_loop.run_in_executor(
                None, self.signal_service.publish_from_results, results
            )

            logger.info(f"Market {event.market}: {len(emitted)} signals emitted")

        except ValidationError as e:
            logger.error(f"Invalid message format: {e}")
            logger.error(f"Message: {message_data}")
        except Exception as e:
            logger.error(f"Error processing price update: {e}")
            logger.error(f"Message: {message_data}")