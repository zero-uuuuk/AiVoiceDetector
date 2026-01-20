from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from .database import engine, Base, SessionLocal
from . import models

# 데이터베이스 테이블 생성 (실제 운영 환경에서는 Alemnbic 등 마이그레이션 도구 권장)
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
def read_root(db: Session = Depends(get_db)):
    try:
        # 간단한 쿼리로 연결 확인
        db.execute(text("SELECT 1"))
        return {"message": "Server is running", "db_connected": True}
    except Exception as e:
        return {"message": "Server is running", "db_connected": False, "error": str(e)}
