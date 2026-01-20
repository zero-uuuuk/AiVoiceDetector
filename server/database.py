from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from config import settings

# RDS 연결 문자열 생성 (DB 설정이 있을 때만)
if all([settings.DB_HOST, settings.DB_NAME, settings.DB_USER, settings.DB_PASSWORD]):
    DATABASE_URL = f"postgresql://{settings.DB_USER}:{settings.DB_PASSWORD}@{settings.DB_HOST}:{settings.DB_PORT}/{settings.DB_NAME}"
    
    # SSL 연결을 위한 엔진 설정 (RDS는 보통 SSL 필요)
    engine = create_engine(
        DATABASE_URL,
        pool_pre_ping=True,  # 연결 유효성 검사
        pool_size=5,  # 연결 풀 크기
        max_overflow=10,  # 추가 연결 허용
        echo=False  # SQL 쿼리 로깅 (개발 시 True로 변경 가능)
    )
    
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
else:
    # DB 설정이 없을 때는 None으로 설정 (개발 환경)
    engine = None
    SessionLocal = None
    print("Warning: Database settings not found. Please create .env file with DB credentials.")

Base = declarative_base()


# Dependency: DB 세션 가져오기
def get_db():
    if SessionLocal is None:
        raise RuntimeError("Database not configured. Please set DB environment variables.")
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
