"""Gemini-powered final interview report for recruiters and candidates."""

from __future__ import annotations

import logging
import time
from typing import Any, Sequence

from app.core.config import settings
from app.domain.entities.interview import FinalInterviewScore
from app.domain.entities.interview_report import InterviewReport
from app.infrastructure.gemini.client import GeminiClient, get_gemini_client

logger = logging.getLogger(__name__)

REPORT_SYSTEM = """You are HYRE's senior hiring analyst. Produce an executive interview report.
Be specific, evidence-based, professional, and fair. Same language as the interview (default Spanish).
Output ONLY valid JSON. No markdown."""


class InterviewReportService:
    def __init__(self, client: GeminiClient | None = None, model: str | None = None) -> None:
        self._client = client or get_gemini_client()
        self._model = model or settings.GEMINI_PRO_MODEL

    def generate(
        self,
        *,
        session: dict[str, Any],
        final_score: FinalInterviewScore,
    ) -> InterviewReport:
        if not settings.GEMINI_API_KEY:
            return self._fallback_report(session, final_score)

        conversation = self._format_conversation(session)
        memory = session.get("interview_memory") or {}
        prompt = f"""Generate a complete post-interview report.

Job: {session.get("job_context", "")}
Required skills: {", ".join(session.get("required_skills") or [])}
Phase reached: {session.get("phase", "unknown")}
Turns: {session.get("turn_count", 0)}

Final scores:
- overall: {final_score.overall_score}
- hire_probability: {final_score.hire_probability}
- recommendation: {final_score.recommendation}
- dimensions: {final_score.dimensions}
- red_flags: {final_score.red_flags}

Interview memory:
{memory}

Conversation:
{conversation}

Return JSON:
{{
  "executive_summary": "3-4 sentences",
  "recommendation_narrative": "2-3 sentences explaining hire/maybe/no_hire",
  "strengths": ["..."],
  "areas_for_improvement": ["..."],
  "technical_assessment": "2 sentences",
  "behavioral_assessment": "2 sentences",
  "communication_assessment": "2 sentences",
  "skill_alignment": ["matched or gap skills"],
  "red_flags_review": ["..."],
  "next_steps": "what HR should do next",
  "interview_highlights": ["memorable moments from answers"],
  "overall_verdict": "one line verdict"
}}"""
        start = time.perf_counter()
        try:
            data = self._client.generate_json(
                system_instruction=REPORT_SYSTEM,
                user_prompt=prompt,
                model_name=self._model,
                temperature=0.45,
            )
            report = InterviewReport.model_validate(data)
            logger.info("Interview report OK %.0fms", (time.perf_counter() - start) * 1000)
            return report
        except Exception as exc:
            logger.error("Report generation failed: %s", exc)
            return self._fallback_report(session, final_score)

    @staticmethod
    def _fallback_report(session: dict[str, Any], final: FinalInterviewScore) -> InterviewReport:
        memory = session.get("interview_memory") or {}
        return InterviewReport(
            executive_summary=(
                f"Entrevista completada con score global {final.overall_score:.0f}/100 "
                f"y probabilidad de contratación {final.hire_probability:.0f}%."
            ),
            recommendation_narrative=f"Recomendación del sistema: {final.recommendation.replace('_', ' ')}.",
            strengths=list(memory.get("strengths", []))[:5] or ["Participación activa en la entrevista"],
            areas_for_improvement=list(memory.get("weaknesses", []))[:5] or ["Profundizar en ejemplos técnicos"],
            technical_assessment=f"Profundidad técnica evaluada: {final.dimensions.get('technical_depth', 0):.0f}/100.",
            behavioral_assessment="Evaluación basada en respuestas conductuales de la sesión.",
            communication_assessment=f"Comunicación: {final.dimensions.get('communication', 0):.0f}/100.",
            skill_alignment=list(memory.get("skills_mentioned", []))[:8],
            red_flags_review=list(final.red_flags)[:5],
            next_steps="Revisar con el equipo de hiring y programar siguiente fase si aplica.",
            interview_highlights=[],
            overall_verdict=final.recommendation.replace("_", " ").title(),
        )

    @staticmethod
    def _format_conversation(session: dict[str, Any]) -> str:
        lines: list[str] = []
        for entry in (session.get("conversation_log") or [])[-20:]:
            lines.append(f"{entry.get('role')}: {(entry.get('content') or '')[:500]}")
        return "\n".join(lines) if lines else "(sin transcripción)"


_service: InterviewReportService | None = None


def get_interview_report_service() -> InterviewReportService:
    global _service
    if _service is None:
        _service = InterviewReportService()
    return _service
