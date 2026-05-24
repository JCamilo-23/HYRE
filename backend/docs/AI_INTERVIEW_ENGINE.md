# HYRE AI Interview Engine

## Architecture

```
Candidate Browser (WebRTC + WS)
        ↓
FastAPI /api/v1/interviews/ws/{session_id}
        ↓
InterviewOrchestrator
   ├── GeminiInterviewAnalyzer (content)
   ├── AudioAnalyzer (librosa)
   ├── FacialAnalyzer (MediaPipe, sampled frames)
   └── ScoringEngine (weighted hire recommendation)
        ↓
WebSocket broadcast → Recruiter dashboard
        ↓
Optional: Celery workers + Redis pub/sub
```

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/v1/interviews/sessions` | Create session |
| GET | `/api/v1/interviews/sessions/{id}/scores` | Current scores |
| POST | `/api/v1/interviews/sessions/{id}/finalize` | End interview |
| WS | `/api/v1/interviews/ws/{id}` | Realtime events |

## WebSocket events (client → server)

- `transcript` — candidate answer text
- `video_frame` — base64 JPEG frame
- `audio_chunk` — base64 audio (optional Celery queue)
- `request_question` — adaptive AI question
- `end_interview` — finalize and score

## Run locally

```bash
# Infrastructure
docker compose -f docker-compose.interview.yml up -d redis

# Backend
cd backend
pip install -r requirements.txt
export GEMINI_API_KEY=your_key
uvicorn app.main:app --reload --port 8000

# Frontend
cd frontend
export NEXT_PUBLIC_API_URL=http://localhost:8000
npm run dev
```

Open: http://localhost:3000/interview

## Database

Apply `migrations/001_ai_interview_engine.sql` in Supabase.

## ML roadmap

- `ml_training_data` + `feature_store` tables ready
- Recruiter feedback loop via `recruiter_feedback`
- Model versioning via `model_versions`

## Persistence (v1.1)

- Sessions: in-memory + optional Redis cache (`interview:session:{id}`)
- When `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set, interviews, messages, events, scores, and ML training rows are written to Postgres
- Apply schema: `backend/migrations/001_ai_interview_engine.sql`

## Frontend STT

- Browser Web Speech API (`useSpeechRecognition`) streams final transcripts over WebSocket
- `MediaRecorder` sends audio chunks every 5s for librosa analysis
- Video frames sampled every 3s (JPEG 320×180) for MediaPipe facial analysis


## Local development (fix "Failed to fetch")

1. **Backend** (terminal 1):
   ```bash
   cd backend
   cp .env.example .env
   # Set GEMINI_API_KEY=... from https://aistudio.google.com/apikey
   pip install fastapi uvicorn pydantic-settings python-multipart google-generativeai Pillow numpy scipy librosa opencv-python-headless stripe resend supabase
   PYTHONPATH=. uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

2. **Frontend** (terminal 2):
   ```bash
   cd frontend
   npm run dev
   ```

3. REST calls use the **Next.js proxy** (`/api/interviews/*`) → no CORS issues.
4. WebSocket connects directly to `NEXT_PUBLIC_API_URL` (default `http://localhost:8000`).
5. Open http://localhost:3000/interview — lobby checks `/api/interviews/health` before starting.
