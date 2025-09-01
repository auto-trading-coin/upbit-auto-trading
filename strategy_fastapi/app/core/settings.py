"""
app/core/settings.py
- .env 또는 환경변수에서 설정을 불러옵니다.
- REDIS_URL, REDIS_SCAN_COUNT 만 노출했습니다. 필요시 확장하세요.
"""
from pydantic_settings import BaseSettings
import os

class Settings(BaseSettings):
    redis_url: str
    redis_scan_count: int

    class Config:
        env_file = ".env"   # 프로젝트 루트의 .env 파일을 읽음
        env_file_encoding = "utf-8"

settings = Settings()
