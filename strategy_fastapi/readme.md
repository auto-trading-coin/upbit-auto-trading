# 전략 서버 디렉토리 구조 (FastAPI 기반)

```text
app/                              # FastAPI 애플리케이션 루트
├── main.py                       # FastAPI 애플리케이션 엔트리포인트
│
├── api/                          # API 엔드포인트 및 의존성 주입
│   ├── deps.py                   # Redis, 전략, 퍼블리셔 의존성 주입(Depends)
│   └── routes.py                 # /health, /run 엔드포인트 정의
│
├── core/                         # 핵심 설정 및 인프라 연결
│   ├── config.py                 # 환경 변수 로드 및 전역 설정(.env)
│   └── redis.py                  # Redis 클라이언트 초기화 및 연결 설정
│
├── schema/                       # 데이터 스키마(Pydantic DTO)
│   ├── chart.py                   # 차트 데이터 DTO
│   └── signal.py                  # 전략 시그널 DTO
│
├── script/                       # 보조 실행/테스트 스크립트
│   └── run_strategies.py          # 로컬 환경에서 전략 실행 테스트
│
├── service/                      # 서비스 계층(비즈니스 오케스트레이션)
│   ├── runner.py                  # Redis 데이터 읽기 → 전략 실행 → 시그널 발행
│   └── publisher.py               # 퍼블리셔 인터페이스 및 stdout 구현
│    
├── stratege/                   # 매매 전략 관련 모듈
│   ├── base.py                    # 전략 추상 클래스(인터페이스)
│   ├── example_ma.py              # 예시 이동평균 전략 구현
│   └── registry.py                # 전략 등록 및 관리

## 실행
```bash
pip install -r requirements.txt
uvicorn app.main:app --reload
# 헬스체크
curl http://localhost:8000/health
# 동기화 완료 시뮬레이션
curl -X POST http://localhost:8000/events/sync-completed -H "Content-Type: application/json" -d '{}'

