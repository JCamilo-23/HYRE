"""Final interview report and live feedback structures."""

from __future__ import annotations

from pydantic import BaseModel, Field


class LiveFeedback(BaseModel):
    headline: str = ""
    strengths: list[str] = Field(default_factory=list)
    improvements: list[str] = Field(default_factory=list)
    highlight_skills: list[str] = Field(default_factory=list)
    communication_note: str = ""
    technical_note: str = ""


class InterviewReport(BaseModel):
    executive_summary: str = ""
    recommendation_narrative: str = ""
    strengths: list[str] = Field(default_factory=list)
    areas_for_improvement: list[str] = Field(default_factory=list)
    technical_assessment: str = ""
    behavioral_assessment: str = ""
    communication_assessment: str = ""
    skill_alignment: list[str] = Field(default_factory=list)
    red_flags_review: list[str] = Field(default_factory=list)
    next_steps: str = ""
    interview_highlights: list[str] = Field(default_factory=list)
    overall_verdict: str = ""
