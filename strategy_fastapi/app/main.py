"""
app/main.py
- FastAPI 앱 구성
- 라우터 포함 및 실행 설정
"""

from fastapi import FastAPI
from app.api.routes import router as main_router

app = FastAPI(title="Strategy FastAPI")

app.include_router(main_router)
