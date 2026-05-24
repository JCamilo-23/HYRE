"""Weighted scoring engine combining multimodal analysis."""

from __future__ import annotations

import logging
from typing import Sequence

from app.domain.entities.interview import (
    AudioAnalysisResult,
    ContentAnalysisResult,
    FacialAnalysisResult,
    FinalInterviewScore,
    ScoringWeights,
)

logger = logging.getLogger(__name__)


def _clamp(value: float, low: float = 0.0, high: float = 100.0) -> float:
    return max(low, min(high, value))


class ScoringEngine:
    """Combines Gemini, audio, facial, and skill signals into hire recommendation."""

    def __init__(self, weights: ScoringWeights | None = None) -> None:
        self._weights = weights or ScoringWeights()

    def compute(
        self,
        *,
        content: ContentAnalysisResult,
        audio: AudioAnalysisResult,
        facial: FacialAnalysisResult,
        required_skills: Sequence[str] | None = None,
        recruiter_overrides: dict[str, float] | None = None,
    ) -> FinalInterviewScore:
        weights = self._weights.model_copy()
        if recruiter_overrides:
            for key, val in recruiter_overrides.items():
                if hasattr(weights, key):
                    setattr(weights, key, val)

        content_score = _clamp(
            (
                content.technical_depth * 0.30
                + content.communication_quality * 0.25
                + content.relevance * 0.20
                + content.reasoning_depth * 0.15
                + content.leadership * 0.10
            )
        )
        authenticity_score = _clamp(
            content.authenticity * (1 - content.ai_generated_probability * 0.5)
        )
        audio_score = _clamp(audio.overall_score)
        facial_score = _clamp(facial.overall_score)

        skill_match_pct = self._skill_match(content.detected_skills, required_skills or [])

        w = weights
        overall = _clamp(
            content_score * w.content
            + audio_score * w.audio
            + facial_score * w.facial
            + authenticity_score * w.authenticity
            + skill_match_pct * w.skill_match
        )

        hire_probability = _clamp(
            overall * 0.85
            + skill_match_pct * 0.10
            + (100 - content.generic_response_probability * 100) * 0.05
        )

        confidence_score = _clamp(
            (audio.vocal_confidence + facial.confidence + content.communication_quality) / 3
        )

        red_flags = list(content.red_flags)
        if content.ai_generated_probability > 0.7:
            red_flags.append("high_ai_generated_answer_probability")
        if content.generic_response_probability > 0.75:
            red_flags.append("generic_responses_detected")
        if audio.nervousness > 80:
            red_flags.append("elevated_nervousness")
        red_flags.extend(content.contradictions[:3])

        recommendation = self._recommendation(overall, hire_probability, red_flags)

        return FinalInterviewScore(
            overall_score=round(overall, 2),
            hire_probability=round(hire_probability, 2),
            skill_match_pct=round(skill_match_pct, 2),
            confidence_score=round(confidence_score, 2),
            authenticity_score=round(authenticity_score, 2),
            content_score=round(content_score, 2),
            audio_score=round(audio_score, 2),
            facial_score=round(facial_score, 2),
            recommendation=recommendation,
            dimensions={
                "technical_depth": content.technical_depth,
                "communication": content.communication_quality,
                "reasoning": content.reasoning_depth,
                "cultural_fit": content.cultural_fit,
                "leadership": content.leadership,
                "eye_contact": facial.eye_contact,
                "vocal_confidence": audio.vocal_confidence,
            },
            red_flags=red_flags,
        )

    @staticmethod
    def _skill_match(detected: Sequence[str], required: Sequence[str]) -> float:
        if not required:
            return 75.0
        detected_set = {s.lower().strip() for s in detected}
        required_set = {s.lower().strip() for s in required}
        if not required_set:
            return 75.0
        overlap = len(detected_set & required_set) / len(required_set)
        return _clamp(overlap * 100)

    @staticmethod
    def _recommendation(overall: float, hire_prob: float, red_flags: list[str]) -> str:
        if red_flags and overall < 60:
            return "no_hire"
        if hire_prob >= 80 and overall >= 75:
            return "strong_hire"
        if hire_prob >= 65 and overall >= 60:
            return "hire"
        if overall >= 45:
            return "maybe"
        return "no_hire"
