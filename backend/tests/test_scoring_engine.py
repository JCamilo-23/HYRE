"""Unit tests for interview scoring engine."""

from app.domain.entities.interview import (
    AudioAnalysisResult,
    ContentAnalysisResult,
    FacialAnalysisResult,
)
from app.domain.services.scoring_engine import ScoringEngine


def test_scoring_strong_hire() -> None:
    engine = ScoringEngine()
    content = ContentAnalysisResult(
        technical_depth=90,
        communication_quality=88,
        relevance=85,
        reasoning_depth=82,
        leadership=75,
        cultural_fit=80,
        authenticity=92,
        generic_response_probability=0.1,
        ai_generated_probability=0.05,
        detected_skills=["react", "typescript", "comunicación"],
        red_flags=[],
    )
    audio = AudioAnalysisResult(
        vocal_confidence=85,
        nervousness=25,
        overall_score=82,
    )
    facial = FacialAnalysisResult(
        eye_contact=80,
        confidence=78,
        overall_score=76,
    )
    result = engine.compute(
        content=content,
        audio=audio,
        facial=facial,
        required_skills=["react", "typescript"],
    )
    assert result.overall_score >= 70
    assert result.hire_probability >= 65
    assert result.recommendation in ("hire", "strong_hire")
    assert result.skill_match_pct >= 50


def test_scoring_no_hire_on_red_flags() -> None:
    engine = ScoringEngine()
    content = ContentAnalysisResult(
        technical_depth=40,
        communication_quality=35,
        relevance=30,
        reasoning_depth=25,
        leadership=20,
        cultural_fit=30,
        authenticity=25,
        generic_response_probability=0.9,
        ai_generated_probability=0.85,
        red_flags=["inconsistent_experience"],
    )
    result = engine.compute(
        content=content,
        audio=AudioAnalysisResult(nervousness=90, overall_score=30),
        facial=FacialAnalysisResult(overall_score=35),
        required_skills=["kubernetes"],
    )
    assert result.recommendation in ("no_hire", "maybe")
    assert "high_ai_generated_answer_probability" in result.red_flags
