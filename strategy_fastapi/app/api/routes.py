"""
app/api/routes.py
- Kafka 또는 외부 호출에 따른 마켓 전략 실행 및 시그널 발행 처리
"""

from fastapi import APIRouter, Depends
from app.services.orchestrator import Orchestrator
from app.services.signal_service import SignalService
from app.core.dependencies import get_orchestrator, get_signal_service

router = APIRouter()

@router.post("/events/price-updated/{market}")
def on_price_updated(
        market: str,
        orchestrator: Orchestrator = Depends(get_orchestrator),
        signal_service: SignalService = Depends(get_signal_service),
):
    results = orchestrator.run_for_market(market)
    emitted = signal_service.publish_from_results(results)
    return {"market": market, "emitted": len(emitted), "signals": emitted}

@router.get("/health")
def health_check():
    """헬스 체크 엔드포인트"""
    return {"status": "healthy"}


@router.post("/consumer/start")
async def start_kafka_consumer_async():
    """Kafka 컨슈머 시작 (테스트용 - 비동기 방식)"""
    import asyncio
    from app.core.dependencies import get_kafka_consumer_service
    
    consumer_service = get_kafka_consumer_service()
    
    # 백그라운드 태스크로 비동기 컨슈머 실행
    asyncio.create_task(consumer_service.start_consuming())
    
    return {"status": "Async Kafka consumer started in background"}
