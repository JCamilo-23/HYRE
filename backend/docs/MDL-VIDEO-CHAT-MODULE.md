# Machine Learning Design Document (MDL)
## Video Chat Module - Real-time Candidate Analysis with Gemini Pro

**Document Version:** 1.0  
**Date:** 2025-05-24  
**Status:** 🚧 In Development  
**Owner:** Backend Team + Frontend Team  
**Module:** `modules/video-analysis`  
**Last Updated:** 2025-05-24

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Feature Definition](#feature-definition)
3. [System Architecture](#system-architecture)
4. [Data Flow](#data-flow)
5. [Analysis Pipeline](#analysis-pipeline)
6. [Real-time Processing](#real-time-processing)
7. [Metrics & Scoring](#metrics--scoring)
8. [Frontend Integration](#frontend-integration)
9. [Backend Implementation](#backend-implementation)
10. [Monitoring & Performance](#monitoring--performance)
11. [Success Criteria](#success-criteria)

---

## 🎯 Overview

### Objective
Create a **real-time video chat module** where:
- 👤 **Candidate** speaks into camera (video + audio)
- 🎥 **System** captures and analyzes in real-time
- 🤖 **Gemini Pro** analyzes:
  - What they say (content)
  - How they say it (voice/tone)
  - How they look (facial expressions/confidence)
- 📊 **Real-time scores** displayed on recruiter dashboard
- 💬 **Instant feedback** to candidate

### Key Features
```
CANDIDATE PERSPECTIVE:
┌─────────────────────────────────┐
│  VIDEO CHAT SCREEN              │
├─────────────────────────────────┤
│                                 │
│  [My Video Feed]  [Mentor AI]   │
│  ┌───────────┐    ┌───────────┐ │
│  │           │    │           │ │
│  │  Candido  │    │ Preguntas │ │
│  │  Hablando │    │  Generadas│ │
│  │           │    │           │ │
│  └───────────┘    └───────────┘ │
│                                 │
│  QUESTION: "Describe a time     │
│  you fixed a production bug"    │
│                                 │
│  [Recording... 2:45]            │
│                                 │
│  📊 LIVE FEEDBACK:              │
│  Clarity: ████████░░ 85/100     │
│  Confidence: ██████░░░░ 65/100  │
│  Communication: ███████░░░ 75/100 │
│                                 │
│  💡 Tip: Slow down your speech  │
│                                 │
└─────────────────────────────────┘

RECRUITER PERSPECTIVE:
┌─────────────────────────────────┐
│  INTERVIEW DASHBOARD            │
├─────────────────────────────────┤
│                                 │
│  Candidate: Juan García         │
│  Position: Senior SWE           │
│  Question 1/5                   │
│                                 │
│  [Video Feed]  [Real-time Chart]│
│  ┌───────────┐ ┌──────────────┐│
│  │           │ │ Clarity  85% ││
│  │ Candidate │ │ Confidence65%││
│  │ Speaking  │ │ Tech Depth82%││
│  │           │ │ Soft Skills75││
│  └───────────┘ └──────────────┘│
│                                 │
│  📝 LIVE TRANSCRIPT:            │
│  "When we had the payment..."   │
│  "...system went down at 3AM"   │
│  "I debugged the database..."   │
│                                 │
│  🎯 SCORES (Updating...):       │
│  Overall: 78/100                │
│  Red Flags: None detected       │
│                                 │
│  🤖 GEMINI ANALYSIS:            │
│  ✓ Good example (specific)      │
│  ✓ Shows problem-solving        │
│  ⚠️ Could explain steps better   │
│                                 │
└─────────────────────────────────┘
```

---

## 🎬 Feature Definition

### What Gets Measured

#### 1️⃣ **AUDIO ANALYSIS** (Voice + Speech)

```
Real-time audio stream → Gemini Pro + Librosa

METRICS EXTRACTED:
├─ Clarity (0-100)
│  ├─ Clear pronunciation
│  ├─ No mumbling
│  ├─ Audible speech
│  └─ Good volume levels
│
├─ Speaking Rate (words per minute)
│  ├─ Target: 120-160 WPM (normal)
│  ├─ Too fast: >200 WPM (nervous, unclear)
│  ├─ Too slow: <100 WPM (uncertain)
│  └─ Measured: Real-time from transcript
│
├─ Confidence Level (0-100)
│  ├─ Smooth voice (no stammering)
│  ├─ No excessive "um", "uh", "like"
│  ├─ Steady tone (no trembling)
│  ├─ Energy level consistent
│  └─ Hesitation count
│
├─ Tone & Sentiment
│  ├─ Positive/Neutral/Negative
│  ├─ Enthusiastic vs. Monotone
│  ├─ Professional tone
│  └─ Emotional state (nervous, calm, excited)
│
└─ Voice Quality
   ├─ Pitch stability
   ├─ Energy consistency
   ├─ Accent/intelligibility
   └─ Background noise level
```

#### 2️⃣ **VIDEO ANALYSIS** (Face + Body Language)

```
Video frames @ 30fps → MediaPipe (local) → Metrics

METRICS EXTRACTED:
├─ Eye Contact (0-100)
│  ├─ Face centered in frame (looking at camera)
│  ├─ Eyes direction consistent
│  ├─ Averted gaze frequency
│  ├─ Blinking rate (normal: 15-20/min)
│  └─ Target: >75/100 for good eye contact
│
├─ Posture & Body Language (0-100)
│  ├─ Head position (straight vs. tilted)
│  ├─ Shoulder alignment
│  ├─ Fidgeting level (hand movement)
│  ├─ Restlessness indicators
│  └─ Upright posture confidence signal
│
├─ Facial Expression (0-100)
│  ├─ Smile presence (when appropriate)
│  ├─ Frown/concern markers
│  ├─ Brow position (raised = engaged)
│  ├─ Mouth shape during speech
│  └─ Emotional expression alignment
│
├─ Engagement Level (0-100)
│  ├─ Activity level (movement)
│  ├─ Attention focus (looking at camera)
│  ├─ Responsiveness (animated vs. static)
│  └─ Interest signals
│
└─ Confidence Indicators (0-100)
   ├─ Combines eye contact + posture + facial
   ├─ Overall presence scoring
   ├─ Professional appearance
   └─ Comfort level
```

#### 3️⃣ **CONTENT ANALYSIS** (What They Say)

```
Transcription → Gemini Pro → Structured Analysis

METRICS EXTRACTED:
├─ Answer Quality (0-100)
│  ├─ Answers the question asked
│  ├─ Relevance to job role
│  ├─ Depth of knowledge shown
│  ├─ Specific examples provided
│  └─ Clarity of explanation
│
├─ Technical Skills (0-100 per skill)
│  ├─ Python, JavaScript, Docker, etc.
│  ├─ Level: Junior / Mid / Senior
│  ├─ Problem-solving approach
│  ├─ Best practices knowledge
│  └─ Experience validation
│
├─ Soft Skills (0-100)
│  ├─ Communication (explains clearly)
│  ├─ Problem-solving (logical approach)
│  ├─ Teamwork (mentions collaboration)
│  ├─ Leadership (initiative shown)
│  └─ Learning ability (growth mindset)
│
├─ Authenticity (0-100)
│  ├─ Real knowledge vs. scripted response
│  ├─ Specific details (not generic)
│  ├─ AI-generated text detection
│  ├─ Genuine experience signals
│  └─ Red flags for false claims
│
└─ Coherence (0-100)
   ├─ Logical flow of answer
   ├─ Complete thoughts (not fragmented)
   ├─ Relevant examples (on topic)
   ├─ Clear beginning-middle-end
   └─ Consistency with previous answers
```

#### 4️⃣ **OVERALL SCORING**

```
Weighted Combination:

FINAL SCORE = (
    Content Score × 0.50 +      # What they say (most important)
    Audio Score × 0.25 +        # How they say it
    Facial Score × 0.15 +       # How they look
    Authenticity × 0.10         # Real knowledge
)

BREAKDOWN:
├─ 0-40: REJECT (significant gaps, weak performance)
├─ 40-60: REVIEW (needs recruiter review)
├─ 60-80: MAYBE (good candidate, interview more)
├─ 80-100: HIRE (strong candidate, fast-track)
└─ Per question: Cumulative average

FINAL RECOMMENDATION:
├─ HIRE (avg >80)
├─ MAYBE (avg 60-80)
├─ REVIEW (avg 40-60)
└─ REJECT (avg <40)
```

---

## 🏗️ System Architecture

### High-Level Flow

```
CANDIDATE STARTS VIDEO CHAT
         ↓
    ┌────────────────────────────────────────┐
    │  FRONTEND (Next.js + WebRTC)           │
    │                                        │
    │  ┌──────────────────────────────────┐ │
    │  │ Camera + Microphone Capture      │ │
    │  ├──────────────────────────────────┤ │
    │  │ • Video: 1280x720, 30fps         │ │
    │  │ • Audio: 16kHz, PCM              │ │
    │  │ • Sent every 100ms               │ │
    │  └──────────────────────────────────┘ │
    │           ↓                             │
    │  ┌──────────────────────────────────┐ │
    │  │ Local Processing (Fast)          │ │
    │  ├──────────────────────────────────┤ │
    │  │ • MediaPipe: Face detection      │ │
    │  │ • Audio: Pitch + energy (local)  │ │
    │  └──────────────────────────────────┘ │
    │           ↓                             │
    │  ┌──────────────────────────────────┐ │
    │  │ WebSocket to Backend             │ │
    │  ├──────────────────────────────────┤ │
    │  │ • Audio chunks                   │ │
    │  │ • Video frames                   │ │
    │  │ • Local analysis results         │ │
    │  └──────────────────────────────────┘ │
    └────────────────────────────────────────┘
         ↓
    ┌────────────────────────────────────────┐
    │  BACKEND (FastAPI + Python)            │
    │                                        │
    │  ┌──────────────────────────────────┐ │
    │  │ WebSocket Handler                │ │
    │  │ • Receive data                   │ │
    │  │ • Route to analyzers             │ │
    │  │ • Orchestrate pipeline           │ │
    │  └──────────────────────────────────┘ │
    │           ↓↓↓ (Parallel)               │
    │  ┌────────┴────────┬────────┬─────────┐
    │  ↓                 ↓        ↓         ↓
    │ ┌──────────┐ ┌──────────┐ ┌──┐ ┌──────────┐
    │ │Speech-   │ │MediaPipe │ │  │ │Gemini   │
    │ │to-Text   │ │Facial    │ │  │ │Pro API  │
    │ │(Google)  │ │Analysis  │ │  │ │(Content)│
    │ └──────────┘ └──────────┘ │  │ └──────────┘
    │      ↓            ↓        │  │      ↓
    │    TEXT         FACIAL     │  │   CONTENT
    │    METRICS      METRICS    │  │   ANALYSIS
    │                            ↓  ↓
    │                      ┌──────────────┐
    │                      │ Audio Analysis│
    │                      │(Librosa)      │
    │                      └──────────────┘
    │                            ↓
    │                      AUDIO METRICS
    │  ┌────────────────────────────────────┐
    │  │ Scoring Engine (Weighted Combine)  │
    │  │ • Audio (25%)                      │
    │  │ • Facial (15%)                     │
    │  │ • Content (50%)                    │
    │  │ • Authenticity (10%)               │
    │  └────────────────────────────────────┘
    │           ↓
    │  ┌────────────────────────────────────┐
    │  │ Real-time Updates (WebSocket)      │
    │  └────────────────────────────────────┘
    └────────────────────────────────────────┘
         ↓
    ┌────────────────────────────────────────┐
    │  RECRUITER DASHBOARD                   │
    │  • Live scores chart                   │
    │  • Transcript                          │
    │  • Feedback                            │
    │  • Red flags                           │
    └────────────────────────────────────────┘
```

### Technology Stack

```
FRONTEND:
├─ Next.js 15 (App Router)
├─ WebRTC (SimpleWay library)
├─ Web Audio API (audio capture)
├─ Canvas API (video frame extraction)
├─ Socket.IO (real-time updates)
├─ React Hooks (state management)
├─ Tailwind CSS (styling)
└─ Recharts (live charts)

BACKEND:
├─ FastAPI (async Python framework)
├─ Python 3.11
├─ google-generativeai (Gemini Pro)
├─ google-cloud-speech (STT streaming)
├─ librosa (audio analysis)
├─ MediaPipe (local, no network)
├─ OpenCV (video processing)
├─ asyncio (concurrency)
├─ PostgreSQL (results storage)
├─ Redis (caching)
└─ WebSocket (real-time comms)

INFRASTRUCTURE:
├─ Google Cloud Run (compute, auto-scale)
├─ Cloud Storage (video/audio backup)
├─ BigQuery (analytics)
├─ Cloud Memorystore (Redis cache)
└─ Cloud Logging (monitoring)
```

---

## 📊 Data Flow

### Step-by-Step Flow

```
STEP 1: INITIALIZATION
├─ User clicks "Start Interview"
├─ Browser requests camera + mic permissions
├─ WebSocket connects to backend
└─ Backend creates session in PostgreSQL

STEP 2: QUESTION GENERATION
├─ Backend queries job info
├─ Gemini Pro generates question 1/5
├─ Send to frontend
└─ Display on screen

STEP 3: CANDIDATE SPEAKS
├─ Audio + Video streaming starts
├─ Every 100ms chunk sent to backend
├─ Transcription begins (async)
├─ Analysis begins (async)
└─ Local metrics calculated

STEP 4: REAL-TIME ANALYSIS (Every 100ms)
├─ Audio Chunk Analysis:
│  ├─ Extract pitch, energy, clarity
│  ├─ Count hesitations
│  ├─ Calculate speech rate
│  └─ Send to frontend
│
├─ Video Frame Analysis:
│  ├─ Detect face + eyes
│  ├─ Measure eye contact
│  ├─ Detect smile/frown
│  └─ Send to frontend
│
└─ Text Analysis (Incremental):
   ├─ STT generates partial transcript
   ├─ Buffer 5-10 words
   ├─ Send to Gemini Pro (streaming)
   ├─ Get incremental analysis
   └─ Send to frontend

STEP 5: DISPLAY LIVE FEEDBACK
├─ Frontend receives updates
├─ Update progress bars in real-time
├─ Show live transcript
├─ Display tips/suggestions
└─ Update chart

STEP 6: QUESTION DONE
├─ Candidate clicks "Next Question"
├─ Generate final score for this question
├─ Calculate overall stats
├─ Generate next question
└─ Loop back to STEP 3

STEP 7: INTERVIEW COMPLETE
├─ Candidate finishes all 5 questions
├─ Backend generates final analysis
├─ Calculate overall score
├─ Generate recommendations
├─ Store in database
└─ Show results to candidate + recruiter
```

### Data Structures

```
WEBSOCKET MESSAGE FORMAT:

// From Frontend → Backend
{
  "type": "audio_chunk" | "video_frame" | "transcript_partial",
  "interview_id": "uuid",
  "question_id": "uuid",
  "data": {
    "audio": "base64_encoded", // 100ms chunk
    "video": "base64_encoded", // frame
    "transcript": "partial text"
  },
  "timestamp": "2025-05-24T12:34:56Z"
}

// From Backend → Frontend
{
  "type": "audio_metrics" | "facial_metrics" | "content_score" | "recommendation",
  "data": {
    // AUDIO METRICS
    "clarity": 85,
    "speech_rate": 145,
    "confidence": 75,
    "hesitations": 2,

    // FACIAL METRICS
    "eye_contact": 82,
    "posture": 78,
    "engagement": 75,

    // CONTENT METRICS
    "answer_quality": 88,
    "technical_depth": 82,
    "soft_skills": 75,
    "authenticity": 90,

    // COMBINED
    "overall_score": 82,
    "feedback": "Great technical explanation!",
    "red_flags": []
  },
  "timestamp": "2025-05-24T12:34:56Z"
}

DATABASE SCHEMA:

interviews table:
├─ interview_id (UUID, PK)
├─ candidate_id (FK)
├─ job_id (FK)
├─ started_at (timestamp)
├─ ended_at (timestamp)
├─ overall_score (0-100)
├─ recommendation (HIRE/MAYBE/REVIEW/REJECT)
└─ raw_data (JSON)

interview_responses table:
├─ response_id (UUID, PK)
├─ interview_id (FK)
├─ question_id (FK)
├─ question_text (text)
├─ transcript (text) ← Full STT output
├─ duration_seconds (int)
├─ audio_metrics (JSONB)
│  ├─ clarity
│  ├─ speech_rate
│  ├─ confidence
│  └─ hesitations
├─ facial_metrics (JSONB)
│  ├─ eye_contact
│  ├─ posture
│  └─ engagement
├─ content_analysis (JSONB)
│  ├─ answer_quality
│  ├─ technical_depth
│  ├─ soft_skills
│  └─ authenticity
├─ response_score (0-100)
└─ gemini_feedback (text)
```

---

## 🤖 Analysis Pipeline

### Pipeline Architecture

```
INPUT: Audio + Video + Transcript (Streaming)

┌─────────────────────────────────────┐
│  AUDIO ANALYZER (Librosa)           │
│  • Every 100ms                      │
│  • Local processing (fast)          │
│  • No API calls                     │
└────────────┬────────────────────────┘
             ↓
        AUDIO METRICS:
        • Clarity: 85/100
        • Speech Rate: 145 WPM
        • Confidence: 75/100
        • Hesitations: 2
             ↓
    ┌───────────────────────────────────┐
    │  VIDEO ANALYZER (MediaPipe)       │
    │  • Every 33ms (30fps)             │
    │  • Local processing (fast)        │
    │  • No API calls                   │
    └───────────┬───────────────────────┘
                ↓
           FACIAL METRICS:
           • Eye Contact: 82/100
           • Posture: 78/100
           • Engagement: 75/100
                ↓
    ┌────────────────────────────────────┐
    │  SPEECH-TO-TEXT (Google Cloud)     │
    │  • Streaming transcription         │
    │  • Updates every 500ms             │
    │  • Low latency API                 │
    └────────────┬─────────────────────┘
                 ↓
            PARTIAL TRANSCRIPT:
            "When we had the payment..."
                 ↓
    ┌──────────────────────────────────┐
    │  GEMINI PRO (Content Analysis)    │
    │  • Stream-enabled                 │
    │  • Analyzes incremental text      │
    │  • Returns structured JSON        │
    └──────────┬────────────────────────┘
               ↓
    CONTENT ANALYSIS (Incremental):
    {
      "answer_quality": 85,
      "technical_depth": 82,
      "soft_skills": 78,
      "authenticity": 88,
      "feedback": "Good example!",
      "red_flags": []
    }
               ↓
    ┌──────────────────────────────────┐
    │  SCORING ENGINE                  │
    │  • Weighted combination          │
    │  • Real-time calculation         │
    └──────────┬────────────────────────┘
               ↓
    FINAL RESPONSE SCORE:
    {
      "overall": 82,
      "breakdown": {
        "content": 85,
        "audio": 78,
        "facial": 82,
        "authenticity": 88
      }
    }
               ↓
    SEND TO FRONTEND (WebSocket)
    Display on recruiter dashboard
```

### Gemini Pro Integration

```python
# backend/app/services/gemini_service.py

class GeminiAnalyzer:
    def __init__(self):
        self.model = GenerativeModel('gemini-pro')
    
    async def analyze_response_streaming(
        self,
        transcript: str,
        job_role: str,
        job_description: str
    ) -> AsyncGenerator[dict, None]:
        """
        Analyze response WITH STREAMING
        Returns partial analysis every few tokens
        """
        
        prompt = f"""
Eres un entrevistador experto en {job_role}.
Estás evaluando una respuesta de un candidato EN TIEMPO REAL.

JOB DESCRIPTION:
{job_description}

RESPUESTA DEL CANDIDATO:
{transcript}

Devuelve análisis en JSON (que se actualiza mientras escribo):

{{
    "answer_quality": 0-100,  # ¿Responde la pregunta?
    "technical_depth": 0-100, # ¿Muestra knowledge técnico?
    "soft_skills": 0-100,     # ¿Communication, teamwork?
    "authenticity": 0-100,    # ¿Sounds real or scripted?
    "clarity": 0-100,         # ¿Clear explanation?
    "specific_examples": true/false,
    "feedback": "brief comment",
    "red_flags": ["flag1"] or []
}}

Sé crítico pero justo. Detecta respuestas genéricas.
"""
        
        # STREAMING RESPONSE (baja latencia)
        response = self.model.generate_content(
            prompt,
            stream=True
        )
        
        buffer = ""
        for chunk in response:
            buffer += chunk.text
            
            # Intentar parsear JSON parcial
            try:
                start = buffer.rfind('{')
                end = buffer.rfind('}')
                
                if start != -1 and end != -1 and end > start:
                    json_str = buffer[start:end+1]
                    analysis = json.loads(json_str)
                    
                    yield {
                        "type": "analysis_update",
                        "data": analysis
                    }
            except json.JSONDecodeError:
                pass
```

---

## ⚡ Real-time Processing

### Latency Budget

```
TARGET: <500ms (perceived real-time)

┌────────┬──────────┬────────┬──────────┬──────────┐
│ 0ms    │ 100ms    │ 200ms  │ 350ms    │ 500ms    │
└────────┴──────────┴────────┴──────────┴──────────┘
  │
  Audio chunk arrives
  │
  ├─ Audio analysis: 50ms
  │  └─ Extract pitch, energy, clarity
  │
  ├─ Video frame analysis: 50ms  (parallel)
  │  └─ MediaPipe face detection
  │
  ├─ Speech-to-Text API call: 100-150ms
  │  └─ Sent to Google Cloud
  │
  ├─ Gemini streaming starts: 250ms
  │  └─ Returns first tokens
  │
  └─ Scoring calculation: 20ms
     └─ Simple weighted formula

PIPELINING (Parallel processing):
- Chunk 0: Audio + Video analysis
- Chunk 1: STT API call
- Chunk 2: Gemini analysis
- Chunk 3: Scoring + frontend update

Result: All operations overlap = faster total time
```

### Backend WebSocket Handler

```python
# backend/app/api/v1/simulator/video_chat.py

from fastapi import WebSocket, APIRouter
import asyncio
from app.services.audio_analyzer import AudioAnalyzer
from app.services.speech_to_text import SpeechToTextService
from app.services.gemini_service import GeminiAnalyzer
from app.services.scoring_service import ScoringEngine

router = APIRouter()
analyzer_audio = AudioAnalyzer()
analyzer_gemini = GeminiAnalyzer()
stt_service = SpeechToTextService()
scoring_engine = ScoringEngine()

@router.websocket("/ws/video-chat/{interview_id}")
async def websocket_video_chat(
    websocket: WebSocket,
    interview_id: str
):
    """
    WebSocket para video chat en tiempo real
    """
    await websocket.accept()
    
    # Session data
    session = {
        "interview_id": interview_id,
        "transcript": "",
        "audio_metrics_history": [],
        "facial_metrics_history": [],
        "content_analysis_history": []
    }
    
    try:
        while True:
            # Recibir data del cliente (audio/video)
            data = await websocket.receive_json()
            
            if data["type"] == "audio_chunk":
                # 1. Analizar audio (rápido, local)
                audio_base64 = data["audio"]
                audio_metrics = await analyzer_audio.analyze_chunk(audio_base64)
                
                # Enviar audio metrics immediately
                await websocket.send_json({
                    "type": "audio_metrics",
                    "data": audio_metrics
                })
                
                session["audio_metrics_history"].append(audio_metrics)
            
            elif data["type"] == "video_frame":
                # 2. Analizar video (rápido, local)
                frame_base64 = data["video"]
                facial_metrics = await analyzer_facial.analyze_frame(frame_base64)
                
                # Enviar facial metrics
                await websocket.send_json({
                    "type": "facial_metrics",
                    "data": facial_metrics
                })
                
                session["facial_metrics_history"].append(facial_metrics)
            
            elif data["type"] == "transcript_update":
                # 3. Analizar content (Gemini)
                transcript = data["transcript"]
                is_final = data["is_final"]
                
                session["transcript"] = transcript
                
                # Enviar transcripción
                await websocket.send_json({
                    "type": "transcript",
                    "text": transcript
                })
                
                # Si es respuesta final, hacer análisis completo
                if is_final and len(transcript.split()) > 10:
                    # Gemini Pro streaming analysis
                    async for analysis_chunk in analyzer_gemini.analyze_response_streaming(
                        transcript=transcript,
                        job_role="senior-engineer",
                        job_description="Build scalable systems"
                    ):
                        # Enviar analysis incremental
                        await websocket.send_json({
                            "type": "content_analysis",
                            "data": analysis_chunk["data"]
                        })
                        
                        session["content_analysis_history"].append(
                            analysis_chunk["data"]
                        )
                    
                    # Calcular score final para esta respuesta
                    final_score = await scoring_engine.calculate_final_score(
                        audio_history=session["audio_metrics_history"],
                        facial_history=session["facial_metrics_history"],
                        content_analysis=session["content_analysis_history"][-1]
                    )
                    
                    await websocket.send_json({
                        "type": "response_score",
                        "data": final_score
                    })
            
            elif data["type"] == "end_interview":
                # Finalizar entrevista
                final_stats = await calculate_overall_stats(session)
                
                await websocket.send_json({
                    "type": "interview_complete",
                    "data": final_stats
                })
                break
    
    except Exception as e:
        await websocket.send_json({
            "type": "error",
            "message": str(e)
        })
    
    finally:
        # Guardar en base de datos
        await save_interview_to_db(session)
```

---

## 📈 Metrics & Scoring

### Scoring Formula

```
AUDIO SCORE:
audio_score = (
    clarity × 0.40 +              # Clear speech
    (100 - hesitation_penalty) × 0.30 +  # No "um", "uh"
    (100 - speed_deviation) × 0.20 +     # Normal WPM
    energy_stability × 0.10       # Consistent tone
)

FACIAL SCORE:
facial_score = (
    eye_contact × 0.50 +          # Looking at camera
    posture × 0.30 +              # Upright, confident
    engagement × 0.20             # Animated, interested
)

CONTENT SCORE:
content_score = (
    answer_quality × 0.35 +       # Answers question
    technical_depth × 0.30 +      # Shows knowledge
    soft_skills × 0.20 +          # Communication
    authenticity × 0.15           # Real knowledge
)

FINAL RESPONSE SCORE:
response_score = (
    content_score × 0.50 +        # Most important
    audio_score × 0.25 +
    facial_score × 0.15 +
    authenticity × 0.10           # Bonus/penalty
)

MIN: 0, MAX: 100
Round to nearest 5 (0, 5, 10, 15, ... 100)
```

### Real-time Dashboard Update

```
Frontend receives WebSocket messages every 100ms:

1. Audio metrics → Update "Clarity", "Confidence" bars
2. Facial metrics → Update "Eye Contact", "Posture" bars
3. Content analysis → Update "Answer Quality", "Depth" bars
4. Overall score → Update main score circle

Example progression:
├─ t=0s: User starts speaking
├─ t=1s: Clarity: 65/100, Confidence: 70/100
├─ t=2s: Clarity: 78/100, Confidence: 75/100, Eye Contact: 82/100
├─ t=3s: All metrics populated, Overall: 76/100
├─ t=4s: Gemini starts returning feedback
├─ t=5s: Final score: 82/100, Feedback displayed
└─ Candidate clicks "Next Question"
```

---

## 🎨 Frontend Integration

### Video Chat Component

```typescript
// frontend/modules/video-analysis/components/VideoChat.tsx

'use client'

import { useEffect, useRef, useState } from 'react'
import SimplePeer from 'simple-peer'
import { useSocket } from '@/hooks/useSocket'

interface Metrics {
  audio: { clarity: number; confidence: number; speech_rate: number }
  facial: { eye_contact: number; posture: number; engagement: number }
  content: { quality: number; depth: number; soft_skills: number }
  overall: number
}

export const VideoChat: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [metrics, setMetrics] = useState<Metrics>({
    audio: { clarity: 0, confidence: 0, speech_rate: 0 },
    facial: { eye_contact: 0, posture: 0, engagement: 0 },
    content: { quality: 0, depth: 0, soft_skills: 0 },
    overall: 0
  })
  const [transcript, setTranscript] = useState('')
  const [feedback, setFeedback] = useState('')
  
  const socket = useSocket()

  useEffect(() => {
    // Conectar a WebSocket
    socket?.on('audio_metrics', (data) => {
      setMetrics(prev => ({
        ...prev,
        audio: data,
        overall: calculateOverall({ ...prev, audio: data })
      }))
    })

    socket?.on('facial_metrics', (data) => {
      setMetrics(prev => ({
        ...prev,
        facial: data,
        overall: calculateOverall({ ...prev, facial: data })
      }))
    })

    socket?.on('content_analysis', (data) => {
      setMetrics(prev => ({
        ...prev,
        content: data,
        overall: calculateOverall({ ...prev, content: data })
      }))
      setFeedback(data.feedback)
    })

    socket?.on('transcript', (data) => {
      setTranscript(prev => prev + ' ' + data.text)
    })

    return () => {
      socket?.off('audio_metrics')
      socket?.off('facial_metrics')
      socket?.off('content_analysis')
      socket?.off('transcript')
    }
  }, [socket])

  return (
    <div className="grid grid-cols-3 gap-4 h-screen p-4">
      {/* Video */}
      <div className="col-span-2 bg-black rounded">
        <video ref={videoRef} autoPlay muted className="w-full h-full" />
      </div>

      {/* Live Metrics */}
      <div className="bg-gray-100 rounded p-4 overflow-y-auto">
        <h2 className="font-bold text-xl mb-4">
          Overall: {Math.round(metrics.overall)}/100
        </h2>

        {/* Audio Metrics */}
        <div className="mb-6">
          <h3 className="font-bold text-sm mb-2">Audio Quality</h3>
          <MetricBar label="Clarity" value={metrics.audio.clarity} />
          <MetricBar label="Confidence" value={metrics.audio.confidence} />
          <MetricBar label="Speech Rate" value={metrics.audio.speech_rate} />
        </div>

        {/* Facial Metrics */}
        <div className="mb-6">
          <h3 className="font-bold text-sm mb-2">Body Language</h3>
          <MetricBar label="Eye Contact" value={metrics.facial.eye_contact} />
          <MetricBar label="Posture" value={metrics.facial.posture} />
          <MetricBar label="Engagement" value={metrics.facial.engagement} />
        </div>

        {/* Content Metrics */}
        <div className="mb-6">
          <h3 className="font-bold text-sm mb-2">Content Quality</h3>
          <MetricBar label="Answer Quality" value={metrics.content.quality} />
          <MetricBar label="Technical Depth" value={metrics.content.depth} />
          <MetricBar label="Soft Skills" value={metrics.content.soft_skills} />
        </div>

        {/* Transcript */}
        <div className="mb-4">
          <h3 className="font-bold text-sm mb-2">Transcript</h3>
          <p className="text-xs text-gray-600 bg-white p-2 rounded max-h-20 overflow-y-auto">
            {transcript || '(Listening...)'}
          </p>
        </div>

        {/* Feedback */}
        {feedback && (
          <div className="bg-blue-50 border border-blue-200 rounded p-2">
            <p className="text-xs text-blue-800">{feedback}</p>
          </div>
        )}
      </div>
    </div>
  )
}

const MetricBar: React.FC<{ label: string; value: number }> = ({ label, value }) => (
  <div className="mb-3">
    <div className="flex justify-between text-xs mb-1">
      <span>{label}</span>
      <span className="font-bold">{Math.round(value)}/100</span>
    </div>
    <div className="w-full bg-gray-300 rounded-full h-2">
      <div
        className={`h-2 rounded-full transition-all ${
          value >= 80 ? 'bg-green-500' :
          value >= 60 ? 'bg-yellow-500' :
          'bg-red-500'
        }`}
        style={{ width: `${value}%` }}
      />
    </div>
  </div>
)

function calculateOverall(metrics: Metrics): number {
  const { audio, facial, content } = metrics
  return (
    (content.quality * 0.50) +
    ((audio.clarity + audio.confidence) / 2 * 0.25) +
    ((facial.eye_contact + facial.posture) / 2 * 0.15) +
    (content.depth * 0.10)
  )
}
```

---

## 🔧 Backend Implementation

### Complete Backend Setup

```python
# backend/requirements.txt
fastapi==0.109.0
python-socketio==5.10.0
google-generativeai==0.3.0
google-cloud-speech==2.21.0
librosa==0.10.0
mediaipe==0.10.0
opencv-python==4.8.0
numpy==1.24.0
scipy==1.11.0
sqlalchemy==2.0.0
psycopg2-binary==2.9.0
redis==5.0.0
python-dotenv==1.0.0
pydantic==2.0.0
```

```python
# backend/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import socketio

from app.api.v1 import router as api_router
from app.api.websocket.video_chat import router as ws_router

app = FastAPI(title="HYRE AI Interview Engine")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://hyre.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# Routes
app.include_router(api_router)
app.include_router(ws_router)

@app.get("/health")
async def health_check():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

```python
# backend/app/services/audio_analyzer.py
import librosa
import numpy as np
from typing import dict

class AudioAnalyzer:
    async def analyze_chunk(self, audio_base64: str) -> dict:
        """Analyze 100ms audio chunk"""
        
        # Decodificar
        import base64
        import io
        import soundfile as sf
        
        audio_bytes = base64.b64decode(audio_base64)
        audio_data, sr = sf.read(io.BytesIO(audio_bytes))
        
        # Extractar features
        clarity = self._calculate_clarity(audio_data)
        speech_rate = self._calculate_speech_rate(audio_data, sr)
        confidence = self._calculate_confidence(audio_data)
        
        return {
            "clarity": clarity,
            "speech_rate": speech_rate,
            "confidence": confidence,
            "hesitations": self._count_hesitations(audio_data)
        }
    
    def _calculate_clarity(self, audio_data):
        """ZCR score"""
        zcr = librosa.feature.zero_crossing_rate(audio_data)[0]
        return min(100, float(np.mean(zcr) * 100))
    
    def _calculate_speech_rate(self, audio_data, sr):
        """Estimate WPM"""
        onset_frames = librosa.onset.onset_detect(y=audio_data, sr=sr)
        duration = len(audio_data) / sr
        return float((len(onset_frames) / duration) * 60 / 4) if duration > 0 else 0
    
    def _calculate_confidence(self, audio_data):
        """Energy stability"""
        rms = librosa.feature.rms(y=audio_data)[0]
        return 100 - min(100, float(np.std(rms)))
    
    def _count_hesitations(self, audio_data):
        """Count 'um', 'uh' patterns"""
        rms = librosa.feature.rms(y=audio_data)[0]
        hesitation_frames = np.where(rms < np.mean(rms) * 0.5)[0]
        return int(len(hesitation_frames) / 10)
```

```python
# backend/app/services/facial_analyzer.py
import mediapipe as mp
import numpy as np

class FacialAnalyzer:
    def __init__(self):
        self.mp_face = mp.solutions.face_detection
        self.detector = self.mp_face.FaceDetection(
            model_selection=1,
            min_detection_confidence=0.5
        )
    
    async def analyze_frame(self, frame_base64: str) -> dict:
        """Analyze video frame"""
        
        import base64
        import io
        from PIL import Image
        
        # Decodificar
        frame_bytes = base64.b64decode(frame_base64)
        frame_image = Image.open(io.BytesIO(frame_bytes))
        frame_rgb = np.array(frame_image)
        
        # Detectar face
        results = self.detector.process(frame_rgb)
        
        if not results.detections:
            return {"eye_contact": 0, "posture": 0, "engagement": 0}
        
        detection = results.detections[0]
        bbox = detection.location_data.bounding_box
        
        # Calcular métricas
        eye_contact = self._calculate_eye_contact(bbox, frame_rgb.shape)
        posture = self._calculate_posture(bbox, frame_rgb.shape)
        
        return {
            "eye_contact": eye_contact,
            "posture": posture,
            "engagement": (eye_contact + posture) / 2
        }
    
    def _calculate_eye_contact(self, bbox, frame_shape):
        """How centered is the face?"""
        frame_center_x = frame_shape[1] / 2
        frame_center_y = frame_shape[0] / 2
        
        face_center_x = (bbox.xmin + bbox.width / 2) * frame_shape[1]
        face_center_y = (bbox.ymin + bbox.height / 2) * frame_shape[0]
        
        distance = np.sqrt(
            (face_center_x - frame_center_x) ** 2 +
            (face_center_y - frame_center_y) ** 2
        )
        
        max_distance = np.sqrt(frame_center_x ** 2 + frame_center_y ** 2)
        
        return max(0, 100 - (distance / max_distance) * 100)
    
    def _calculate_posture(self, bbox, frame_shape):
        """Head position"""
        aspect_ratio = bbox.height / bbox.width if bbox.width > 0 else 0
        ideal_ratio = 1.1
        deviation = abs(aspect_ratio - ideal_ratio) / ideal_ratio
        return max(0, 100 - (deviation * 100))
```

---

## 📊 Monitoring & Performance

### Metrics to Track

```
PERFORMANCE:
├─ Inference latency (ms)
│  ├─ p50, p95, p99
│  ├─ Target: <500ms
│  └─ Alert: >800ms
│
├─ API uptime
│  ├─ Gemini availability
│  ├─ STT availability
│  └─ Target: >99.9%
│
└─ Error rate
   ├─ Failed analyses
   ├─ Crashes
   └─ Target: <0.1%

BUSINESS:
├─ Interviews/day
├─ Average score distribution
├─ Hire rate
├─ Recruiter agreement
└─ 3-month retention

QUALITY:
├─ Score correlation with hiring success
├─ False positive rate (reject good candidate)
├─ False negative rate (hire bad candidate)
└─ Fairness across demographics
```

### Logging & Debugging

```python
# backend/app/middleware/logging.py
import logging
import json
from datetime import datetime

logger = logging.getLogger(__name__)

async def log_analysis(
    interview_id: str,
    response_id: str,
    metrics: dict,
    analysis: dict
):
    """Log every analysis for debugging"""
    
    log_entry = {
        "timestamp": datetime.utcnow().isoformat(),
        "interview_id": interview_id,
        "response_id": response_id,
        "metrics": metrics,
        "analysis": analysis
    }
    
    logger.info(json.dumps(log_entry))
    
    # Send to Cloud Logging
    # send_to_cloud_logging(log_entry)
```

---

## ✅ Success Criteria

### Launch Checklist
- [ ] Latency <500ms (p95)
- [ ] No API errors during testing
- [ ] All metrics displaying on dashboard
- [ ] Recruiter can see live feedback
- [ ] Results saved correctly to database
- [ ] Candidate sees their score and feedback

### Quality Metrics
- [ ] 80%+ agreement between Gemini and human evaluators
- [ ] <2% error rate
- [ ] <50ms variance in latency
- [ ] Fairness score >0.8 across demographics

### Scale Metrics
- [ ] 100 concurrent interviews
- [ ] 1,000 interviews/day without degradation
- [ ] <$2,500/month in API costs

---

## 🚀 Deployment

### Cloud Run Configuration

```yaml
# gcloud-run.yaml
runtime: python311
entrypoint: python app/main.py

env:
  GEMINI_API_KEY: ${GEMINI_API_KEY}
  GOOGLE_CLOUD_PROJECT: hyre-ai
  DATABASE_URL: ${DATABASE_URL}
  REDIS_URL: ${REDIS_URL}

resources:
  memory: 2Gi
  cpu: 2

autoscaling:
  maxInstances: 100
  minInstances: 3
  targetConcurrency: 50
```

---

**MDL COMPLETED FOR VIDEO CHAT MODULE** ✅

Este MDL define completamente:
- ✅ Qué se mide en video chat
- ✅ Cómo funciona la captura de audio/video
- ✅ Cómo se procesa en tiempo real
- ✅ Cómo Gemini Pro analiza
- ✅ Cómo se combinan las métricas
- ✅ Frontend + Backend implementation
- ✅ Monitoring y éxito

---

## Related HYRE Documentation

- [AI Interview Engine](./AI_INTERVIEW_ENGINE.md) — implemented orchestrator, WebSocket API, and scoring on `feature/ai-interview-engine`
- SQL schema: `../migrations/001_ai_interview_engine.sql`
