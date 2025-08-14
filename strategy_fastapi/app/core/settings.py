
"""
app/core/settings.py
- .env 또는 환경변수에서 설정을 불러옵니다.
- REDIS_URL, REDIS_SCAN_COUNT 만 노출했습니다. 필요시 확장하세요.
"""
from pydantic_settings import BaseSettings
import os

class Settings(BaseSettings):
    redis_url: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    redis_scan_count: int = int(os.getenv("REDIS_SCAN_COUNT", "1000"))

settings = Settings()
