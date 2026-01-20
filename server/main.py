from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import settings
from routers import questions

app = FastAPI(
    title="AI Voice Detector API",
    description="AI 음성 탐지 게임을 위한 API",
    version="1.0.0"
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,  # property 사용
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 라우터 등록
app.include_router(questions.router)


@app.get("/")
async def root():
    return {"message": "AI Voice Detector API", "status": "running"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
