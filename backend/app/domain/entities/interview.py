"""Interview engine domain entities."""

from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Any
from uuid import UUID

from pydantic import BaseModel, Field


class InterviewStatus(str, Enum):
    SCHEDULED = "scheduled"
    LIVE = "live"
    PROCESSING = "processing"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    FAILED = "failed"


class InterviewMode(str, Enum):
    LIVE = "live"
    COPILOT = "copilot"
    ASYNC = "async"
    PRACTICE = "practice"


class MessageRole(str, Enum):
    SYSTEM = "system"
    INTERVIEWER = "interviewer"
    CANDIDATE = "candidate"
    AI = "ai"


class InterviewSession(BaseModel):
    id: UUID
    candidate_id: UUID
    recruiter_id: UUID | None = None
    job_id: UUID | None = None
    status: InterviewStatus = InterviewStatus.SCHEDULED
    mode: InterviewMode = InterviewMode.LIVE
    started_at: datetime | None = None
    ended_at: datetime | None = None
    metadata: dict[str, Any] = Field(default_factory=dict)


class InterviewMessage(BaseModel):
    role: MessageRole
    content: str
    transcript_confidence: float | None = None
    metadata: dict[str, Any] = Field(default_factory=dict)


class ContentAnalysisResult(BaseModel):
    technical_depth: float = Field(ge=0, le=100)
    communication_quality: float = Field(ge=0, le=100)
    relevance: float = Field(ge=0, le=100)
    reasoning_depth: float = Field(ge=0, le=100)
    leadership: float = Field(ge=0, le=100)
    cultural_fit: float = Field(ge=0, le=100)
    authenticity: float = Field(ge=0, le=100)
    generic_response_probability: float = Field(ge=0, le=1)
    ai_generated_probability: float = Field(ge=0, le=1)
    contradictions: list[str] = Field(default_factory=list)
    detected_skills: list[str] = Field(default_factory=list)
    soft_skills: list[str] = Field(default_factory=list)
    summary: str = ""
    red_flags: list[str] = Field(default_factory=list)


class AudioAnalysisResult(BaseModel):
    speaking_pace_wpm: float = 0.0
    pause_ratio: float = 0.0
    hesitation_count: int = 0
    vocal_confidence: float = Field(50.0, ge=0, le=100)
    nervousness: float = Field(50.0, ge=0, le=100)
    pitch_stability: float = Field(50.0, ge=0, le=100)
    clarity: float = Field(50.0, ge=0, le=100)
    emotional_tone: str = "neutral"
    overall_score: float = Field(50.0, ge=0, le=100)


class FacialAnalysisResult(BaseModel):
    eye_contact: float = Field(50.0, ge=0, le=100)
    posture: float = Field(50.0, ge=0, le=100)
    facial_stability: float = Field(50.0, ge=0, le=100)
    confidence: float = Field(50.0, ge=0, le=100)
    attention: float = Field(50.0, ge=0, le=100)
    engagement: float = Field(50.0, ge=0, le=100)
    body_language_score: float = Field(50.0, ge=0, le=100)
    overall_score: float = Field(50.0, ge=0, le=100)
    notes: list[str] = Field(default_factory=list)


class ScoringWeights(BaseModel):
    content: float = 0.50
    audio: float = 0.25
    facial: float = 0.15
    authenticity: float = 0.10
    skill_match: float = 0.0


class FinalInterviewScore(BaseModel):
    overall_score: float
    hire_probability: float
    skill_match_pct: float
    confidence_score: float
    authenticity_score: float
    content_score: float
    audio_score: float
    facial_score: float
    recommendation: str
    dimensions: dict[str, float]
    red_flags: list[str] = Field(default_factory=list)
