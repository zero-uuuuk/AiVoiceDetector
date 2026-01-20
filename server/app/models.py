from sqlalchemy import Column, Integer, String, Boolean, Text
from .database import Base

class Voice(Base):
    __tablename__ = "Voice"

    id = Column(Integer, primary_key=True, autoincrement=True, nullable=False)
    name = Column(String(255), nullable=False)
    audio_address = Column(String(500), nullable=False)
    # HUAMN일 때만 존재, AI는 NULL
    video_address = Column(String(500), default=None, nullable=True)
    
    # 1=AI, 0=HUMAN
    # SQLAlchemy의 Boolean은 대부분의 DB에서 TINYINT(1) 등으로 매핑됩니다.
    ai_human = Column(Boolean, nullable=False, comment='1=AI, 0=HUMAN')
    
    HH = Column(Integer, default=0)
    HA = Column(Integer, default=0)
    AH = Column(Integer, default=0)
    AA = Column(Integer, default=0)
