from sqlalchemy import Column, Integer, String
from database import Base


class Voice(Base):
    __tablename__ = "Voice"  # 실제 테이블 이름
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    audio_address = Column(String(500), nullable=False)  # 음성 파일 경로/URL
    video_address = Column(String(500), nullable=True)  # 영상 파일 경로/URL (HUMAN일 때만 존재)
    ai_human = Column(Integer, nullable=False)  # 1=AI, 0=HUMAN
    HH = Column(Integer, default=0)  # Human -> Human (맞음)
    HA = Column(Integer, default=0)  # Human -> AI (틀림)
    AH = Column(Integer, default=0)  # AI -> Human (틀림)
    AA = Column(Integer, default=0)  # AI -> AI (맞음)
