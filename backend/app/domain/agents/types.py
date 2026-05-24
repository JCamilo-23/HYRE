"""Multi-agent interview system types."""

from __future__ import annotations

from enum import Enum
from typing import Any

from pydantic import BaseModel, Field


class AgentType(str, Enum):
    TECH = "tech"
    CREATIVE = "creative"
    BUSINESS = "business"
    AUTO = "auto"


class CompanyStyle(str, Enum):
    BALANCED = "balanced"
    GOOGLE = "google"
    STARTUP = "startup"
    CREATIVE = "creative"
    CORPORATE = "corporate"


class CompanyProfile(BaseModel):
    """Company personality layer — shapes tone, depth, and hiring philosophy."""

    name: str = "HYRE"
    style: CompanyStyle = CompanyStyle.BALANCED
    values: list[str] = Field(default_factory=lambda: ["ownership", "excellence", "collaboration"])
    intensity: str = "medium"  # relaxed | medium | intense
    hiring_philosophy: str = "Hire for impact, learning velocity, and authentic craft."
    communication_tone: str = "professional_warm"
    technical_bar: str = "high"  # standard | high | elite
    environment: str = "startup"  # startup | scaleup | corporate


class CultureFitInsights(BaseModel):
    personality_signals: list[str] = Field(default_factory=list)
    communication_insights: list[str] = Field(default_factory=list)
    startup_fit_score: float = Field(50.0, ge=0, le=100)
    leadership_indicators: list[str] = Field(default_factory=list)
    adaptability_score: float = Field(50.0, ge=0, le=100)
    authenticity_signals: list[str] = Field(default_factory=list)
    red_flags: list[str] = Field(default_factory=list)
    psychological_summary: str = ""
    cultural_alignment_score: float = Field(50.0, ge=0, le=100)
    ai_generated_risk: float = Field(0.0, ge=0, le=1)
    generic_answer_risk: float = Field(0.0, ge=0, le=1)
    personality_profile: str = ""


class InterviewerTurnResult(BaseModel):
    message: str = ""
    question: str = ""
    phase: str = "greeting"
    phase_label: str = ""
    difficulty: str = "medium"
    progress_pct: int = 0
    follow_up_reason: str = ""
    should_advance_phase: bool = False
    transition_note: str = ""
    agent_type: str = "tech"
    agent_display_name: str = ""


class InterviewAgentContext(BaseModel):
    job_context: str = ""
    required_skills: list[str] = Field(default_factory=list)
    company_profile: CompanyProfile = Field(default_factory=CompanyProfile)
    session: dict[str, Any] = Field(default_factory=dict)
