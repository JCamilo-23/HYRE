"""Backward-compatible facade over the multi-agent interview coordinator."""

from __future__ import annotations

from typing import Any

from app.domain.agents.coordinator import (
    InterviewAgentCoordinator,
    get_interview_agent_coordinator,
)
from app.domain.agents.types import InterviewerTurnResult
from app.domain.entities.interview import ContentAnalysisResult

# Re-export for existing imports
__all__ = [
    "AIInterviewerEngine",
    "InterviewerTurnResult",
    "get_ai_interviewer_engine",
]


class AIInterviewerEngine:
    """Delegates to InterviewAgentCoordinator (Tech / Creative / Business + Culture)."""

    def __init__(self, coordinator: InterviewAgentCoordinator | None = None) -> None:
        self._coordinator = coordinator or get_interview_agent_coordinator()

    def build_opening_turn(
        self,
        *,
        job_context: str,
        required_skills: list[str],
        candidate_name_hint: str = "",
        session: dict[str, Any] | None = None,
    ) -> InterviewerTurnResult:
        if session is None:
            raise ValueError("session required for multi-agent opening turn")
        return self._coordinator.build_opening_turn(
            session, candidate_name_hint=candidate_name_hint
        )

    def build_next_turn(
        self,
        *,
        session: dict[str, Any],
        candidate_answer: str,
        content_analysis: ContentAnalysisResult | None = None,
    ) -> InterviewerTurnResult:
        return self._coordinator.build_next_turn(
            session,
            candidate_answer=candidate_answer,
            content_analysis=content_analysis,
        )

    def build_closing_turn(self, *, session: dict[str, Any]) -> InterviewerTurnResult:
        return self._coordinator.build_closing_turn(session)

    def apply_turn_to_session(
        self,
        session: dict[str, Any],
        turn: InterviewerTurnResult,
        *,
        advance_phase_counter: bool = True,
    ) -> None:
        self._coordinator.apply_turn_to_session(
            session, turn, advance_phase_counter=advance_phase_counter
        )

    @staticmethod
    def maybe_auto_advance_phase(session: dict[str, Any], min_turns_per_phase: int = 2) -> None:
        from app.domain.agents.base import BaseInterviewerAgent

        BaseInterviewerAgent.maybe_auto_advance_phase(session, min_turns_per_phase)


_engine: AIInterviewerEngine | None = None


def get_ai_interviewer_engine() -> AIInterviewerEngine:
    global _engine
    if _engine is None:
        _engine = AIInterviewerEngine()
    return _engine
