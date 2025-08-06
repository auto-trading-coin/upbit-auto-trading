# 전략 서버 디렉토리 구조 (FastAPI 기반)

```text
app/
├── api/                 # (거의 사용 안될 예정이나 기본 구성 유지)
│   └── consumer.py      # Kafka 메시지 수신 핸들러
├── core/                # 설정, 의존성 주입, 로깅 등
│   ├── config.py        # 환경변수 및 설정
│   ├── kafka.py         # Kafka consumer/producer 세팅
│   └── redis.py         # Redis 연결 설정
├── crud/                # (DB 미사용 → 전략 실행만 관리. 미구현 또는 생략 가능)
├── db/                  # (DB 없음 → 빈 디렉토리로 유지 또는 제거)
├── models/              # 전략 객체 또는 Enum, 전략별 추상 클래스 등
│   └── strategy_base.py # 전략 추상 클래스
├── schemas/             # (DTO 용도 – 전략 시그널 포맷 정의)
│   └── signal.py
├── services/            # 전략 실행 모듈들
│   └── example_strategy.py
├── workers/             # Kafka 수신 후 Redis → 전략 판단 실행 핸들러
│   └── strategy_runner.py
└── main.py              # 엔트리포인트 (FastAPI 앱 정의만)
