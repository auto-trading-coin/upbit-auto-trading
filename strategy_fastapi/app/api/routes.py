
"""
app/api/routes.py
- 외부에서 호출 가능한 HTTP 엔드포인트를 정의합니다.
- 운영에서는 카프카 컨슈머가 동일 오케스트레이터를 호출하면 되고,
  개발/테스트에서는 이 HTTP 엔드포인트를 통해 플로우를 재현합니다.
"""
from typing import Optional
from fastapi import APIRouter, Request, Body
from ..schema.models import SyncCompleted

router = APIRouter()

@router.post("/events/sync-completed")
def sync_completed(_: Optional[SyncCompleted] = Body(default=None), request: Request = None):
    """
    동기화 완료 이벤트 트리거
    - Body 는 선택 사항입니다. (카프카 메타데이터를 넣고 싶으면 SyncCompleted 스키마 사용)
    - 내부적으로 orchestrator.handle_sync_completed() 를 호출하여
      Redis 스캔 -> 멀티타임프레임(MTF) 전략 판단 -> (BUY/SELL) 시그널 발행을 수행합니다.
    """
    orchestrator = request.app.state.orchestrator
    signals = orchestrator.handle_sync_completed()
    return {"emitted": len(signals), "signals": [s.model_dump() for s in signals]}
