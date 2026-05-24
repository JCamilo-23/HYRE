"""Conversational AI interviewer — phased flow, memory, adaptive Gemini turns."""

from __future__ import annotations

import logging
import time
from typing import Any, Sequence

from pydantic import BaseModel, Field

from app.core.config import settings
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

INTERVIEWER_SYSTEM = """You are a senior technical recruiter and hiring manager conducting a LIVE video interview for HYRE.
You behave like a real human interviewer: warm, professional, curious, and adaptive.

Rules:
- Speak naturally in the same language the candidate uses (default Spanish if unclear).
- ONE turn at a time: brief acknowledgment (1 sentence) + ONE clear question (1-2 sentences max).
- Never list multiple questions. Never output bullet lists.
- Reference specific details from the candidate's last answer when asking follow-ups.
- Adapt difficulty: strong answers → harder/deeper; weak/vague answers → simpler or pivot topics gently.
- No discriminatory questions. No trick questions. No fake praise.
- You evaluate silently via separate analysis; your spoken turn is only conversational interviewing.
- Output ONLY valid JSON matching the schema requested. No markdown."""


class InterviewerTurnResult(BaseModel):
    message: str = Field(description="Full conversational turn shown in chat")
    question: str = Field(description="Primary question text, prominent in UI")
    phase: str = InterviewPhase.GREETING.value
    phase_label: str = ""
    difficulty: str = "medium"
    progress_pct: int = 0
    follow_up_reason: str = ""
    should_advance_phase: bool = False
    transition_note: str = ""


class AIInterviewerEngine:
    """Generates dynamic interviewer turns with session memory and phase awareness."""

    def __init__(self, client: GeminiClient | None = None, model: str | None = None) -> None:
        self._client = client or get_gemini_client()
        self._model = model or settings.GEMINI_PRO_MODEL

    def _ensure_configured(self) -> None:
        if not settings.GEMINI_API_KEY:
            raise ValueError(
                "GEMINI_API_KEY is not configured. Set it in backend/.env or frontend/.env.local"
            )

    def build_opening_turn(
        self,
        *,
        job_context: str,
        required_skills: Sequence[str],
        candidate_name_hint: str = "",
    ) -> InterviewerTurnResult:
        """Greeting + first warm-up question to start the interview."""
        self._ensure_configured()
        skills = ", ".join(required_skills) if required_skills else "rol general tecnología"
        prompt = f"""Start a live interview. Phase: greeting → warmup.

Job context: {job_context or "General technology role"}
Required skills: {skills}
Candidate hint: {candidate_name_hint or "unknown"}

Generate JSON:
{{
  "message": "Warm greeting + brief intro of yourself as HYRE interviewer + first easy warm-up question",
  "question": "The warm-up question only",
  "phase": "greeting",
  "phase_label": "Introducción",
  "difficulty": "easy",
  "progress_pct": 5,
  "follow_up_reason": "",
  "should_advance_phase": false,
  "transition_note": ""
}}"""
        data = self._generate_turn_json(prompt)
        return self._normalize_turn(data, phase=InterviewPhase.GREETING.value, phase_turn=0)

    def build_next_turn(
        self,
        *,
        session: dict[str, Any],
        candidate_answer: str,
        content_analysis: ContentAnalysisResult | None = None,
    ) -> InterviewerTurnResult:
        """After a candidate answer: follow-up or next phase question."""
        self._ensure_configured()
        memory = session.get("interview_memory") or default_memory()
        phase = session.get("phase", InterviewPhase.GREETING.value)
        phase_turn = int(session.get("phase_turn_count", 0))
        turn_count = int(session.get("turn_count", 0))
        job_context = session.get("job_context", "")
        required_skills = session.get("required_skills", [])

        history = self._format_history(session)
        analysis_block = ""
        if content_analysis:
            analysis_block = f"""
Latest answer analysis (use for adaptation, do not repeat verbatim):
- technical_depth: {content_analysis.technical_depth}
- communication_quality: {content_analysis.communication_quality}
- reasoning_depth: {content_analysis.reasoning_depth}
- detected_skills: {content_analysis.detected_skills}
- summary: {content_analysis.summary}
- red_flags: {content_analysis.red_flags}
"""

        memory_block = f"""
Interview memory (accumulated):
- skills_mentioned: {memory.get("skills_mentioned", [])}
- strengths: {memory.get("strengths", [])}
- weaknesses: {memory.get("weaknesses", [])}
- difficulty_level: {memory.get("difficulty_level", "medium")}
- performance_trend: {memory.get("performance_trend", "neutral")}
- topics_covered: {memory.get("topics_covered", [])}
- notes: {memory.get("notes", "")[:500]}
"""

        phase_guidance = self._phase_guidance(phase, phase_turn, turn_count)

        prompt = f"""Continue the LIVE interview.

Current phase: {phase} ({PHASE_LABELS.get(phase, phase)})
Phase turn count: {phase_turn}
Total candidate answers so far: {turn_count}
Job: {job_context or "Technology role"}
Required skills: {", ".join(required_skills) or "general"}

{phase_guidance}

{memory_block}
{analysis_block}

Conversation so far:
{history}

Candidate's latest answer:
{candidate_answer[:4000]}

Instructions:
1. Acknowledge their answer naturally (1 short sentence).
2. Ask ONE intelligent follow-up OR next question suited to the current phase.
3. If they mentioned tech (Docker, K8s, APIs, etc.), drill into specifics.
4. Adjust difficulty based on analysis scores (high depth → harder question).
5. Set should_advance_phase true only when this phase has enough depth (usually 2+ exchanges in phase).
6. Choose phase for NEXT question (may stay same or move to next in order: greeting→warmup→technical→problem_solving→behavioral→deep_followup→reflection→closing).

Return JSON:
{{
  "message": "acknowledgment + question as natural speech",
  "question": "the question alone",
  "phase": "one of: greeting,warmup,technical,problem_solving,behavioral,deep_followup,reflection,closing",
  "phase_label": "human label in interview language",
  "difficulty": "easy|medium|hard",
  "progress_pct": 0-100,
  "follow_up_reason": "why this follow-up (short)",
  "should_advance_phase": false,
  "transition_note": "optional phrase when changing phase",
  "memory_update": {{
    "skills_mentioned": ["new skills from this answer"],
    "strengths": ["..."],
    "weaknesses": ["..."],
    "personality_notes": ["..."],
    "confidence_trend": "rising|stable|falling",
    "difficulty_level": "easy|medium|hard",
    "performance_trend": "improving|stable|declining",
    "topics_covered": ["..."],
    "stack_mentions": ["..."],
    "notes": "1 sentence memory for next turn"
  }}
}}"""
        data = self._generate_turn_json(prompt)
        result = self._normalize_turn(
            data,
            phase=data.get("phase", phase),
            phase_turn=phase_turn,
        )
        if data.get("memory_update"):
            self._merge_memory(memory, data["memory_update"])
        session["interview_memory"] = memory

        if data.get("should_advance_phase"):
            nxt = next_phase(result.phase)
            if nxt:
                result.phase = nxt
                result.phase_label = PHASE_LABELS.get(nxt, nxt)
                if data.get("transition_note"):
                    result.message = f"{data['transition_note']} {result.message}"

        return result

    def build_closing_turn(self, *, session: dict[str, Any]) -> InterviewerTurnResult:
        """Final closing message when interview ends."""
        self._ensure_configured()
        memory = session.get("interview_memory") or default_memory()
        prompt = f"""Close the interview professionally.

Memory: {memory}
Messages count: {len(session.get("messages", []))}

Return JSON with phase "closing":
{{
  "message": "Thank candidate, brief positive closure, mention next steps (HR will follow up). No new interview questions.",
  "question": "Is there anything else you'd like us to know about you?",
  "phase": "closing",
  "phase_label": "Cierre",
  "difficulty": "easy",
  "progress_pct": 100,
  "follow_up_reason": "",
  "should_advance_phase": false,
  "transition_note": ""
}}"""
        data = self._generate_turn_json(prompt)
        return self._normalize_turn(data, phase=InterviewPhase.CLOSING.value, phase_turn=0)

    def apply_turn_to_session(
        self,
        session: dict[str, Any],
        turn: InterviewerTurnResult,
        *,
        advance_phase_counter: bool = True,
    ) -> None:
        """Persist interviewer turn and update phase counters."""
        prev_phase = session.get("phase", InterviewPhase.GREETING.value)
        log = session.setdefault("conversation_log", [])
        log.append(
            {
                "role": "interviewer",
                "content": turn.message,
                "question": turn.question,
                "phase": turn.phase,
            }
        )
        session.setdefault("messages", []).append(
            {
                "role": "interviewer",
                "content": turn.message,
                "metadata": {"question": turn.question, "phase": turn.phase},
            }
        )
        session["current_question"] = turn.question
        session["phase"] = turn.phase
        session["phase_label"] = turn.phase_label or PHASE_LABELS.get(turn.phase, turn.phase)
        session["difficulty"] = turn.difficulty
        session["progress_pct"] = turn.progress_pct

        if turn.phase != prev_phase:
            session["phase_turn_count"] = 0
        elif advance_phase_counter:
            session["phase_turn_count"] = int(session.get("phase_turn_count", 0)) + 1

    def _generate_turn_json(self, user_prompt: str) -> dict[str, Any]:
        start = time.perf_counter()
        data = self._client.generate_json(
            system_instruction=INTERVIEWER_SYSTEM,
            user_prompt=user_prompt,
            model_name=self._model,
            temperature=0.72,
        )
        elapsed = (time.perf_counter() - start) * 1000
        logger.info("AI interviewer turn OK %.0fms model=%s", elapsed, self._model)
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
        label = data.get("phase_label") or PHASE_LABELS.get(p, p)
        pct = int(data.get("progress_pct", progress_pct(p, phase_turn)))
        question = (data.get("question") or "").strip()
        message = (data.get("message") or question).strip()
        if question and question not in message:
            message = f"{message} {question}".strip() if message else question
        if not question:
            question = message
        return InterviewerTurnResult(
            message=message,
            question=question,
            phase=p,
            phase_label=label,
            difficulty=data.get("difficulty", "medium"),
            progress_pct=min(100, max(0, pct)),
            follow_up_reason=data.get("follow_up_reason", ""),
            should_advance_phase=bool(data.get("should_advance_phase")),
            transition_note=data.get("transition_note", ""),
        )

    def _merge_memory(self, memory: dict[str, Any], update: dict[str, Any]) -> None:
        for key in ("skills_mentioned", "strengths", "weaknesses", "personality_notes", "topics_covered", "stack_mentions"):
            incoming = update.get(key) or []
            if not isinstance(incoming, list):
                continue
            existing = set(memory.get(key, []))
            for item in incoming:
                if item and str(item) not in existing:
                    memory.setdefault(key, []).append(str(item))
                    existing.add(str(item))
        for scalar in ("confidence_trend", "difficulty_level", "performance_trend"):
            if update.get(scalar):
                memory[scalar] = update[scalar]
        if update.get("notes"):
            memory["notes"] = str(update["notes"])[:1000]

    def _format_history(self, session: dict[str, Any]) -> str:
        lines: list[str] = []
        for entry in (session.get("conversation_log") or [])[-12:]:
            role = entry.get("role", "unknown")
            content = (entry.get("content") or "")[:600]
            lines.append(f"{role}: {content}")
        for msg in session.get("messages", [])[-8:]:
            role = msg.get("role", "user")
            content = (msg.get("content") or "")[:600]
            lines.append(f"{role}: {content}")
        return "\n".join(lines) if lines else "(start of interview)"

    def _phase_guidance(self, phase: str, phase_turn: int, turn_count: int) -> str:
        guides = {
            InterviewPhase.GREETING.value: "Welcome, set expectations, light rapport. Move to warmup soon.",
            InterviewPhase.WARMUP.value: "Background, motivation, recent experience. Behavioral-light.",
            InterviewPhase.TECHNICAL.value: "Role-specific technical depth, stack, architecture, tradeoffs.",
            InterviewPhase.PROBLEM_SOLVING.value: "Scenario or debugging approach, how they structure thinking.",
            InterviewPhase.BEHAVIORAL.value: "STAR-style teamwork, conflict, ownership, leadership.",
            InterviewPhase.DEEP_FOLLOWUP.value: "Challenge prior answers, probe inconsistencies, advanced depth.",
            InterviewPhase.REFLECTION.value: "What they learned, what they'd do differently, career goals.",
            InterviewPhase.CLOSING.value: "Wrap up only; no heavy new topics.",
        }
        base = guides.get(phase, "Continue professional interview.")
        return f"{base} Phase exchanges so far: {phase_turn}. Total answers: {turn_count}."

    @staticmethod
    def maybe_auto_advance_phase(session: dict[str, Any], min_turns_per_phase: int = 2) -> None:
        """Deterministic nudge if model did not advance but phase is saturated."""
        if int(session.get("phase_turn_count", 0)) < min_turns_per_phase:
            return
        current = session.get("phase", InterviewPhase.GREETING.value)
        nxt = next_phase(current)
        if nxt and phase_index(current) < len(InterviewPhase) - 2:
            session["phase"] = nxt
            session["phase_turn_count"] = 0


_engine: AIInterviewerEngine | None = None


def get_ai_interviewer_engine() -> AIInterviewerEngine:
    global _engine
    if _engine is None:
        _engine = AIInterviewerEngine()
    return _engine
