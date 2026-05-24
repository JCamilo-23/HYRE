"""Base interviewer agent — shared memory, phases, and Gemini turn generation."""

from __future__ import annotations

import logging
import time
from abc import ABC, abstractmethod
from typing import Any, Sequence

from app.core.config import settings
from app.domain.agents.company_personality import CompanyPersonalityLayer
from app.domain.agents.prompts import (
    FORBIDDEN_PATTERNS,
    JSON_TURN_SCHEMA,
    MIN_MESSAGE_CHARS,
    MIN_QUESTION_CHARS,
    PREMIUM_STRUCTURE,
)
from app.domain.agents.types import (
    CompanyProfile,
    InterviewerTurnResult,
    InterviewAgentContext,
)
from app.domain.entities.interview import ContentAnalysisResult
from app.domain.entities.interview_phases import (
    PHASE_LABELS,
    InterviewPhase,
    default_memory,
    next_phase,
    phase_index,
    progress_pct,
)
from app.infrastructure.gemini.client import GeminiClient, get_gemini_client

logger = logging.getLogger(__name__)


class BaseInterviewerAgent(ABC):
    """Core conversational interviewer — extended by specialized recruiters."""

    agent_type: str = "base"
    display_name: str = "HYRE Interviewer"
    specialty_label: str = "General"

    def __init__(self, client: GeminiClient | None = None, model: str | None = None) -> None:
        self._client = client or get_gemini_client()
        self._model = model or settings.GEMINI_PRO_MODEL

    @abstractmethod
    def persona_block(self) -> str:
        """Agent-specific personality and evaluation focus."""

    @abstractmethod
    def specialty_examples(self) -> str:
        """Few-shot quality examples for this agent."""

    @abstractmethod
    def phase_focus(self, phase: str) -> str:
        """Phase-specific guidance for this specialty."""

    def build_system_instruction(self, company: CompanyProfile) -> str:
        base = f"""You are {self.display_name}, a senior AI hiring intelligence agent for HYRE.
You conduct LIVE video interviews for: {self.specialty_label}.

{self.persona_block()}

{FORBIDDEN_PATTERNS}
{PREMIUM_STRUCTURE}

Language: match the candidate (default Spanish if unclear).
One turn only. Output valid JSON only.
"""
        return CompanyPersonalityLayer.augment_system_prompt(base, company)

    def build_opening_turn(
        self,
        *,
        ctx: InterviewAgentContext,
        candidate_name_hint: str = "",
    ) -> InterviewerTurnResult:
        company = ctx.company_profile
        skills = ", ".join(ctx.required_skills) or "rol profesional"
        prompt = f"""OPENING TURN — phase: greeting → warmup.

Role / job: {ctx.job_context or "Professional role at " + company.name}
Required capabilities: {skills}
Candidate: {candidate_name_hint or "unknown"}

Introduce yourself briefly as {self.display_name} representing {company.name}.
Then ask ONE premium warm-up question that already shows senior recruiter quality.

{self.specialty_examples()}

{JSON_TURN_SCHEMA}
  "phase": "greeting",
  "phase_label": "Introducción",
  "difficulty": "easy",
  "progress_pct": 5
}}"""
        return self._generate_and_normalize(prompt, company, phase=InterviewPhase.GREETING.value)

    def build_next_turn(
        self,
        *,
        ctx: InterviewAgentContext,
        candidate_answer: str,
        content_analysis: ContentAnalysisResult | None = None,
    ) -> InterviewerTurnResult:
        session = ctx.session
        company = ctx.company_profile
        memory = session.get("interview_memory") or default_memory()
        phase = session.get("phase", InterviewPhase.GREETING.value)
        phase_turn = int(session.get("phase_turn_count", 0))
        turn_count = int(session.get("turn_count", 0))

        analysis_block = ""
        if content_analysis:
            analysis_block = f"""
Signals from answer analysis (adapt difficulty, do not quote):
technical_depth={content_analysis.technical_depth}, reasoning={content_analysis.reasoning_depth},
communication={content_analysis.communication_quality}, skills={content_analysis.detected_skills},
summary={content_analysis.summary}, red_flags={content_analysis.red_flags}
"""

        prompt = f"""CONTINUE LIVE INTERVIEW — {self.display_name}

Phase: {phase} ({PHASE_LABELS.get(phase, phase)}) | phase_turns={phase_turn} | total_answers={turn_count}
Job: {ctx.job_context}
Skills: {", ".join(ctx.required_skills)}

{self.phase_focus(phase)}

Memory: {memory}
{analysis_block}

Conversation:
{self._format_history(session)}

Latest candidate answer:
{candidate_answer[:4000]}

Rules:
- Reference specific details from their answer in your acknowledgment.
- If they mentioned a technology, go deeper (architecture, tradeoffs, metrics, failures).
- Strong answer → harder scenario or system design angle. Weak/vague → narrower, supportive reframing.
- should_advance_phase only after meaningful depth in this phase (usually 2+ exchanges).

{self.specialty_examples()}

{JSON_TURN_SCHEMA}
  "memory_update": {{
    "skills_mentioned": [], "strengths": [], "weaknesses": [],
    "personality_notes": [], "confidence_trend": "stable",
    "difficulty_level": "medium", "performance_trend": "stable",
    "topics_covered": [], "stack_mentions": [], "notes": ""
  }}
}}"""
        data = self._generate_json(prompt, company)
        result = self._normalize_turn(data, phase=data.get("phase", phase), phase_turn=phase_turn)
        result.agent_type = self.agent_type
        result.agent_display_name = self.display_name

        if data.get("memory_update"):
            self._merge_memory(memory, data["memory_update"])
        session["interview_memory"] = memory

        if data.get("should_advance_phase"):
            nxt = next_phase(result.phase)
            if nxt:
                result.phase = nxt
                result.phase_label = PHASE_LABELS.get(nxt, nxt)
                if data.get("transition_note"):
                    result.message = f"{data['transition_note']} {result.message}".strip()

        return result

    def build_closing_turn(self, *, ctx: InterviewAgentContext) -> InterviewerTurnResult:
        session = ctx.session
        company = ctx.company_profile
        prompt = f"""CLOSING — {self.display_name} at {company.name}

Memory: {session.get("interview_memory", {})}
Messages: {len(session.get("messages", []))}

Warm professional close. One optional final open question for anything they want to add.
No new technical grilling.

{JSON_TURN_SCHEMA}
  "phase": "closing",
  "phase_label": "Cierre",
  "difficulty": "easy",
  "progress_pct": 100
}}"""
        result = self._generate_and_normalize(prompt, company, phase=InterviewPhase.CLOSING.value)
        result.agent_type = self.agent_type
        result.agent_display_name = self.display_name
        return result

    def apply_turn_to_session(
        self,
        session: dict[str, Any],
        turn: InterviewerTurnResult,
        *,
        advance_phase_counter: bool = True,
    ) -> None:
        prev_phase = session.get("phase", InterviewPhase.GREETING.value)
        log = session.setdefault("conversation_log", [])
        log.append(
            {
                "role": "interviewer",
                "content": turn.message,
                "question": turn.question,
                "phase": turn.phase,
                "agent": turn.agent_type,
            }
        )
        session.setdefault("messages", []).append(
            {
                "role": "interviewer",
                "content": turn.message,
                "metadata": {
                    "question": turn.question,
                    "phase": turn.phase,
                    "agent_type": turn.agent_type,
                },
            }
        )
        session["current_question"] = turn.question
        session["phase"] = turn.phase
        session["phase_label"] = turn.phase_label or PHASE_LABELS.get(turn.phase, turn.phase)
        session["difficulty"] = turn.difficulty
        session["progress_pct"] = turn.progress_pct
        session["agent_type"] = turn.agent_type
        session["agent_display_name"] = turn.agent_display_name

        if turn.phase != prev_phase:
            session["phase_turn_count"] = 0
        elif advance_phase_counter:
            session["phase_turn_count"] = int(session.get("phase_turn_count", 0)) + 1

    @staticmethod
    def maybe_auto_advance_phase(session: dict[str, Any], min_turns_per_phase: int = 2) -> None:
        if int(session.get("phase_turn_count", 0)) < min_turns_per_phase:
            return
        current = session.get("phase", InterviewPhase.GREETING.value)
        nxt = next_phase(current)
        if nxt and phase_index(current) < len(InterviewPhase) - 2:
            session["phase"] = nxt
            session["phase_turn_count"] = 0

    def _generate_and_normalize(
        self, user_prompt: str, company: CompanyProfile, *, phase: str
    ) -> InterviewerTurnResult:
        data = self._generate_json(user_prompt, company)
        result = self._normalize_turn(data, phase=phase, phase_turn=0)
        result.agent_type = self.agent_type
        result.agent_display_name = self.display_name
        return result

    def _generate_json(self, user_prompt: str, company: CompanyProfile) -> dict[str, Any]:
        start = time.perf_counter()
        data = self._client.generate_json(
            system_instruction=self.build_system_instruction(company),
            user_prompt=user_prompt,
            model_name=self._model,
            temperature=0.78,
            max_output_tokens=2048,
        )
        logger.info(
            "%s turn OK %.0fms model=%s",
            self.agent_type,
            (time.perf_counter() - start) * 1000,
            self._model,
        )
        return data

    def _normalize_turn(
        self,
        data: dict[str, Any],
        *,
        phase: str,
        phase_turn: int,
    ) -> InterviewerTurnResult:
        p = data.get("phase", phase)
        if p not in {e.value for e in InterviewPhase}:
            p = phase
        question = (data.get("question") or "").strip()
        message = (data.get("message") or "").strip()

        if len(question) < MIN_QUESTION_CHARS and message:
            question = self._extract_question_from_message(message)

        if question and question not in message:
            message = f"{message}\n\n{question}".strip() if message else question

        if len(message) < MIN_MESSAGE_CHARS and question:
            message = f"Gracias por compartir eso. {question}"

        return InterviewerTurnResult(
            message=message,
            question=question or message,
            phase=p,
            phase_label=data.get("phase_label") or PHASE_LABELS.get(p, p),
            difficulty=data.get("difficulty", "medium"),
            progress_pct=min(100, max(0, int(data.get("progress_pct", progress_pct(p, phase_turn))))),
            follow_up_reason=data.get("follow_up_reason", ""),
            should_advance_phase=bool(data.get("should_advance_phase")),
            transition_note=data.get("transition_note", ""),
            agent_type=self.agent_type,
            agent_display_name=self.display_name,
        )

    @staticmethod
    def _extract_question_from_message(message: str) -> str:
        parts = [s.strip() for s in message.replace("?", "?\n").split("\n") if "?" in s or len(s) > 40]
        return max(parts, key=len, default=message) if parts else message

    @staticmethod
    def _merge_memory(memory: dict[str, Any], update: dict[str, Any]) -> None:
        for key in (
            "skills_mentioned",
            "strengths",
            "weaknesses",
            "personality_notes",
            "topics_covered",
            "stack_mentions",
        ):
            incoming = update.get(key) or []
            if not isinstance(incoming, list):
                continue
            existing = set(memory.get(key, []))
            for item in incoming:
                if item and str(item) not in existing:
                    memory.setdefault(key, []).append(str(item))

        for scalar in ("confidence_trend", "difficulty_level", "performance_trend"):
            if update.get(scalar):
                memory[scalar] = update[scalar]
        if update.get("notes"):
            memory["notes"] = str(update["notes"])[:1000]

    @staticmethod
    def _format_history(session: dict[str, Any]) -> str:
        lines: list[str] = []
        for entry in (session.get("conversation_log") or [])[-14:]:
            lines.append(f"{entry.get('role')}: {(entry.get('content') or '')[:700]}")
        return "\n".join(lines) if lines else "(inicio)"
