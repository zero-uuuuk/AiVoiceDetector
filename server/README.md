# AI Voice Detector Server

FastAPI 기반 백엔드 서버입니다.

## 설정

### 1. 의존성 설치

```bash
pip install -r requirements.txt
```

### 2. 환경변수 설정

`.env` 파일이 이미 생성되어 있습니다. 필요시 수정하세요.

### 3. 데이터베이스 테이블

테이블 이름: `Voice`

테이블 구조:
- `id` (INT, PRIMARY KEY, AUTO_INCREMENT)
- `name` (VARCHAR(255))
- `audio_address` (VARCHAR(500)) - 음성 파일 경로/URL
- `video_address` (VARCHAR(500), NULLABLE) - 영상 파일 경로/URL (HUMAN일 때만 존재)
- `ai_human` (TINYINT(1)) - 1=AI, 0=HUMAN
- `HH` (INT) - Human -> Human 통계
- `HA` (INT) - Human -> AI 통계
- `AH` (INT) - AI -> Human 통계
- `AA` (INT) - AI -> AI 통계

## 실행

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## API 엔드포인트

### GET /api/questions

문제를 가져옵니다.

**Query Parameters:**
- `count` (required): 가져올 문제 수

**Response:**
```json
{
  "questions": [
    {
      "id": 1,
      "name": "...",
      "type": "AI",
      "audioUrl": "/voice/ai_1.mp3",
      "videoUrl": null,
      "ai_human": 1
    },
    {
      "id": 2,
      "name": "...",
      "type": "HUMAN",
      "audioUrl": "/voice/human_1.mp3",
      "videoUrl": "/video/human_1.mp4",
      "ai_human": 0
    }
  ],
  "total": 5,
  "ai_count": 3,
  "human_count": 2
}
```

**로직:**
- 짝수면 AI/HUMAN 각각 반반
- 홀수면 AI가 하나 더 많게

## 클라이언트 설정

클라이언트의 `.env` 파일에 다음을 추가하세요:

```env
VITE_API_BASE_URL=http://localhost:8000
```
