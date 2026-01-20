from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from urllib.parse import quote_plus
from dotenv import load_dotenv

load_dotenv()

# 환경 변수에서 개별 접속 정보 로드
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT", "3306")
DB_NAME = os.getenv("DB_NAME")

# DB_URL이 이미 설정되어 있지 않다면 조합하여 생성
if os.getenv("DB_URL"):
    SQLALCHEMY_DATABASE_URL = os.getenv("DB_URL")
else:
    # 호스트 주소에 http://나 https://가 포함되어 있다면 제거 (사용자 실수 방지)
    if DB_HOST:
        DB_HOST = DB_HOST.replace("http://", "").replace("https://", "")
        # 끝에 붙은 / 제거
        if DB_HOST.endswith("/"):
            DB_HOST = DB_HOST[:-1]
            
    # 비밀번호에 특수문자가 있을 수 있으므로 URL 인코딩 처리
    encoded_password = quote_plus(DB_PASSWORD) if DB_PASSWORD else ""
    
    # DB_PORT 유효성 검사 및 정수 변환 시도
    try:
        if DB_PORT and not DB_PORT.isdigit():
             print(f"Warning: Invalid DB_PORT '{DB_PORT}'. Defaulting to 3306.")
             DB_PORT = "3306"
    except Exception:
        DB_PORT = "3306"

    SQLALCHEMY_DATABASE_URL = f"mysql+pymysql://{DB_USER}:{encoded_password}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

# 디버깅을 위해 URL 출력 (비밀번호는 마스킹)
try:
    masked_url = SQLALCHEMY_DATABASE_URL.replace(encoded_password, "****") if encoded_password else SQLALCHEMY_DATABASE_URL
    print(f"Attempting to connect to DB: {masked_url}")

    engine = create_engine(
        SQLALCHEMY_DATABASE_URL,
        pool_pre_ping=True, # 연결 유효성 주기적 확인
        pool_recycle=3600   # 1시간마다 연결 재생성 (MySQL 연결 끊김 방지)
    )
except Exception as e:
    print(f"Error creating database engine: {e}")
    raise e
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()
