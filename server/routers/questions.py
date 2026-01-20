from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from database import get_db
from models import Voice
import random

router = APIRouter(prefix="/api/questions", tags=["questions"])


@router.get("")
async def get_questions(
    count: int,
    db: Session = Depends(get_db)
):
    """
    문제를 가져옵니다.
    
    - count: 가져올 문제 수
    - 짝수면 AI/HUMAN 각각 반반
    - 홀수면 하나가 하나 더 많게 (AI가 더 많게)
    """
    if count <= 0:
        raise HTTPException(status_code=400, detail="count must be greater than 0")
    
    # AI와 HUMAN 개수 계산
    if count % 2 == 0:
        # 짝수: 반반
        ai_count = count // 2
        human_count = count // 2
    else:
        # 홀수: AI가 하나 더 많게
        ai_count = (count + 1) // 2
        human_count = (count - 1) // 2
    
    # AI 샘플 가져오기 (ai_human = 1) - PostgreSQL RANDOM() 사용
    ai_samples = db.query(Voice).filter(
        Voice.ai_human == 1
    ).order_by(text("RANDOM()")).limit(ai_count).all()
    
    # HUMAN 샘플 가져오기 (ai_human = 0) - PostgreSQL RANDOM() 사용
    human_samples = db.query(Voice).filter(
        Voice.ai_human == 0
    ).order_by(text("RANDOM()")).limit(human_count).all()
    
    # 개수 확인
    if len(ai_samples) < ai_count:
        raise HTTPException(
            status_code=404,
            detail=f"Not enough AI samples. Available: {len(ai_samples)}, Required: {ai_count}"
        )
    
    if len(human_samples) < human_count:
        raise HTTPException(
            status_code=404,
            detail=f"Not enough HUMAN samples. Available: {len(human_samples)}, Required: {human_count}"
        )
    
    # 결과 리스트 생성
    questions = []
    
    # AI 샘플 추가
    for sample in ai_samples:
        questions.append({
            "id": sample.id,
            "name": sample.name,
            "type": "AI",
            "audioUrl": sample.audio_address,
            "videoUrl": None,  # AI는 비디오 없음
            "ai_human": sample.ai_human
        })
    
    # HUMAN 샘플 추가
    for sample in human_samples:
        questions.append({
            "id": sample.id,
            "name": sample.name,
            "type": "HUMAN",
            "audioUrl": sample.audio_address,
            "videoUrl": sample.video_address,  # HUMAN은 비디오 있음 (nullable)
            "ai_human": sample.ai_human
        })
    
    # 랜덤 섞기
    random.shuffle(questions)
    
    # ID 재할당 (1부터 시작)
    for idx, question in enumerate(questions, start=1):
        question["id"] = idx
    
    return {
        "questions": questions,
        "total": len(questions),
        "ai_count": ai_count,
        "human_count": human_count
    }
