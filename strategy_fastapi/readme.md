# 전략 서버 디렉토리 구조 (FastAPI 기반)

```text
strategy_fastapi/
├── app/
│   ├── main.py                # FastAPI 앱 생성 및 엔트리포인트
│   ├── api/                   # API 라우터
│   │   ├── routes.py          # /events, /health 등 HTTP 경로 정의
│   ├── core/                  # 핵심 설정 및 환경 변수 관리
│   │   └── config.py
│   ├── models/                # 전략 추상 클래스 및 전략 인터페이스 (ORM X)
│   │   └── strategy_base.py
│   ├── schemas/               # Pydantic DTO (Candle, Signal, Result 등)
│   │   ├── candle.py
│   │   ├── signal.py
│   │   ├── result.py
│   │   └── common.py          # enums, constants 등
│   ├── services/              # 비즈니스 로직 (전략 판단, orchestrator 등)
│   │   ├── orchestrator.py
│   │   └── strategy_runner.py
│   ├── strategies/            # 개별 전략 구현
│   │   ├── rsi_threshold.py
│   │   ├── ema_cross.py
│   │   └── registry.py        # 활성화 전략 등록
│   ├── repositories/          # Redis 데이터 접근 계층
│   │   └── redis_chart.py
│   ├── publishers/            # 퍼블리셔 구현 (Kafka/Dummy 등)
│   │   ├── dummy.py
│   │   └── port.py            # SignalPublisherPort 인터페이스
│   └── utils/                 # 보조 유틸리티 함수들
│       └── parsing.py
├── scripts/                   # 수동 실행 스크립트
│   └── run_once.py
├── tests/                     # 테스트 모듈
│   └── test_flow.py
├── .env
├── pyproject.toml
└── README.md

## 실행
```bash
pip install -r requirements.txt
uvicorn app.main:app --reload
# 헬스체크
curl http://localhost:8000/health
# 동기화 완료 시뮬레이션
curl -X POST http://localhost:8000/events/sync-completed -H "Content-Type: application/json" -d '{}'

