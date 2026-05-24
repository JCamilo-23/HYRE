"""Multi-agent interview coordinator — routes to specialized recruiters + culture layer."""

from __future__ import annotations

from typing import Any

from app.domain.agents.base import BaseInterviewerAgent
from app.domain.agents.company_personality import CompanyPersonalityLayer
from app.domain.agents.culture_fit import CultureFitAgent, get_culture_fit_agent
from app.domain.agents.registry import get_agent, resolve_agent_type
from app.domain.agents.types import (
    CultureFitInsights,
    InterviewAgentContext,
    InterviewerTurnResult,
)
from app.domain.entities.interview import ContentAnalysisResult


class InterviewAgentCoordinator:
    """Facade used by orchestrator — replaces monolithic AIInterviewerEngine."""

    def __init__(self, culture: CultureFitAgent | None = None) -> None:
        self._culture = culture or get_culture_fit_agent()

    def resolve_session_agent(self, session: dict[str, Any]) -> BaseInterviewerAgent:
        agent_type = session.get("agent_type") or resolve_agent_type(
            requested=session.get("agent_type_requested"),
            job_context=session.get("job_context", ""),
            required_skills=session.get("required_skills"),
        )
        session["agent_type"] = agent_type
        return get_agent(agent_type)

    def _ctx(self, session: dict[str, Any]) -> InterviewAgentContext:
        return InterviewAgentContext(
            job_context=session.get("job_context", ""),
            required_skills=session.get("required_skills", []),
            company_profile=CompanyPersonalityLayer.resolve(session.get("company_profile")),
            session=session,
        )

    def build_opening_turn(
        self,
        session: dict[str, Any],
        *,
        candidate_name_hint: str = "",
    ) -> InterviewerTurnResult:
        agent = self.resolve_session_agent(session)
        turn = agent.build_opening_turn(ctx=self._ctx(session), candidate_name_hint=candidate_name_hint)
        agent.apply_turn_to_session(session, turn, advance_phase_counter=False)
        return turn

    def build_next_turn(
        self,
        session: dict[str, Any],
        *,
        candidate_answer: str,
        content_analysis: ContentAnalysisResult | None = None,
    ) -> InterviewerTurnResult:
        agent = self.resolve_session_agent(session)
        turn = agent.build_next_turn(
            ctx=self._ctx(session),
            candidate_answer=candidate_answer,
            content_analysis=content_analysis,
        )
        BaseInterviewerAgent.maybe_auto_advance_phase(session)
        turn.progress_pct = turn.progress_pct  # kept from model
        agent.apply_turn_to_session(session, turn)
        return turn

    def build_closing_turn(self, session: dict[str, Any]) -> InterviewerTurnResult:
        agent = self.resolve_session_agent(session)
        turn = agent.build_closing_turn(ctx=self._ctx(session))
        agent.apply_turn_to_session(session, turn, advance_phase_counter=False)
        return turn

    def analyze_culture_fit(
        self,
        session: dict[str, Any],
        *,
        candidate_answer: str,
        content_analysis: ContentAnalysisResult | None = None,
    ) -> CultureFitInsights:
        insights = self._culture.analyze(
            candidate_answer=candidate_answer,
            session=session,
            content_analysis=content_analysis,
        )
        history = session.setdefault("culture_history", [])
        history.append(insights.model_dump())
        session["culture_insights"] = insights.model_dump()
        session["personality_profile"] = insights.personality_profile
        return insights

    def apply_turn_to_session(
        self,
        session: dict[str, Any],
        turn: InterviewerTurnResult,
        *,
        advance_phase_counter: bool = True,
    ) -> None:
        agent = self.resolve_session_agent(session)
        agent.apply_turn_to_session(session, turn, advance_phase_counter=advance_phase_counter)


_coordinator: InterviewAgentCoordinator | None = None


def get_interview_agent_coordinator() -> InterviewAgentCoordinator:
    global _coordinator
    if _coordinator is None:
        _coordinator = InterviewAgentCoordinator()
    return _coordinator
