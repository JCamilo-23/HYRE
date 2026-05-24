"""Interview flow phases for the conversational AI interviewer."""

from __future__ import annotations

from enum import Enum


class InterviewPhase(str, Enum):
    GREETING = "greeting"
    WARMUP = "warmup"
    TECHNICAL = "technical"
    PROBLEM_SOLVING = "problem_solving"
    BEHAVIORAL = "behavioral"
    DEEP_FOLLOWUP = "deep_followup"
    REFLECTION = "reflection"
    CLOSING = "closing"


PHASE_ORDER: list[InterviewPhase] = [
    InterviewPhase.GREETING,
    InterviewPhase.WARMUP,
    InterviewPhase.TECHNICAL,
    InterviewPhase.PROBLEM_SOLVING,
    InterviewPhase.BEHAVIORAL,
    InterviewPhase.DEEP_FOLLOWUP,
    InterviewPhase.REFLECTION,
    InterviewPhase.CLOSING,
]


PHASE_LABELS: dict[str, str] = {
    InterviewPhase.GREETING.value: "Introducción",
    InterviewPhase.WARMUP.value: "Calentamiento",
    InterviewPhase.TECHNICAL.value: "Evaluación técnica",
    InterviewPhase.PROBLEM_SOLVING.value: "Resolución de problemas",
    InterviewPhase.BEHAVIORAL.value: "Competencias y comportamiento",
    InterviewPhase.DEEP_FOLLOWUP.value: "Profundización",
    InterviewPhase.REFLECTION.value: "Reflexión final",
    InterviewPhase.CLOSING.value: "Cierre",
}


def phase_index(phase: str) -> int:
    try:
        return PHASE_ORDER.index(InterviewPhase(phase))
    except ValueError:
        return 0


def progress_pct(phase: str, phase_turn: int, min_turns_in_phase: int = 2) -> int:
    """Rough progress 0–100 across the interview arc."""
    idx = phase_index(phase)
    total = len(PHASE_ORDER)
    base = int((idx / max(total - 1, 1)) * 85)
    intra = min(14, int((phase_turn / max(min_turns_in_phase, 1)) * 14))
    return min(100, base + intra)


def next_phase(current: str) -> str | None:
    idx = phase_index(current)
    if idx >= len(PHASE_ORDER) - 1:
        return None
    return PHASE_ORDER[idx + 1].value


def default_memory() -> dict:
    return {
        "skills_mentioned": [],
        "strengths": [],
        "weaknesses": [],
        "personality_notes": [],
        "confidence_trend": "neutral",
        "difficulty_level": "medium",
        "performance_trend": "neutral",
        "topics_covered": [],
        "stack_mentions": [],
        "notes": "",
    }
