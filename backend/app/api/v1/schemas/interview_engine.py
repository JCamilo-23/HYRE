"""Pydantic schemas for AI Interview Engine API."""

from __future__ import annotations

from typing import Any
from pydantic import BaseModel, Field


class CreateInterviewRequest(BaseModel):
    candidate_id: str
    recruiter_id: str | None = None
    job_id: str | None = None
    job_context: str = ""
    required_skills: list[str] = Field(default_factory=list)
    mode: str = "live"


class CreateInterviewResponse(BaseModel):
    session_id: str
    ws_url: str
    status: str
    opening_question: str | None = None
    gemini_ready: bool = True


class TranscriptEvent(BaseModel):
    text: str
    confidence: float = 1.0


class InterviewScoreResponse(BaseModel):
    session_id: str
    overall_score: float
    hire_probability: float
    skill_match_pct: float
    confidence_score: float
    authenticity_score: float
    recommendation: str
    dimensions: dict[str, float]
    red_flags: list[str]



class InterviewReportResponse(BaseModel):
    session_id: str
    report: dict[str, Any]
    final_score: dict[str, Any] | None = None
    generated_at: str | None = None
