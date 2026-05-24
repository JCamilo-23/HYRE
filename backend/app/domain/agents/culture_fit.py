"""Culture fit agent — runs alongside specialty recruiters."""

from __future__ import annotations

import logging
import time
from typing import Any

from app.core.config import settings
from app.domain.agents.types import CultureFitInsights
from app.domain.entities.interview import ContentAnalysisResult
from app.infrastructure.gemini.client import GeminiClient, get_gemini_client

logger = logging.getLogger(__name__)

CULTURE_SYSTEM = """You are HYRE's Culture & Authenticity Intelligence layer.
You analyze candidates in parallel with technical/creative/business interviews.
Be fair, evidence-based, and calibrated. Output ONLY valid JSON."""


class CultureFitAgent:
    """Psychological and cultural alignment analysis per answer."""

    def __init__(self, client: GeminiClient | None = None, model: str | None = None) -> None:
        self._client = client or get_gemini_client()
        self._model = model or settings.GEMINI_PRO_MODEL

    def analyze(
        self,
        *,
        candidate_answer: str,
        session: dict[str, Any],
        content_analysis: ContentAnalysisResult | None = None,
    ) -> CultureFitInsights:
        if not settings.GEMINI_API_KEY:
            return self._heuristic(candidate_answer, content_analysis)

        company = session.get("company_profile") or {}
        memory = session.get("interview_memory") or {}
        content_block = ""
        if content_analysis:
            content_block = f"""
Content scores: authenticity={content_analysis.authenticity},
ai_risk={content_analysis.ai_generated_probability},
generic_risk={content_analysis.generic_response_probability},
summary={content_analysis.summary}
"""

        prompt = f"""Analyze culture fit signals from this interview answer.

Company values: {company.get("values", [])}
Company style: {company.get("style", "balanced")}
Environment: {company.get("environment", "startup")}

Memory: {memory}
{content_block}

Candidate answer:
{candidate_answer[:3500]}

Detect: authenticity, startup mindset, ownership, humility, teamwork, pressure handling,
possible AI-generated or rehearsed answers, arrogance, inconsistencies.

Return JSON:
{{
  "personality_signals": ["..."],
  "communication_insights": ["..."],
  "startup_fit_score": 0-100,
  "leadership_indicators": ["..."],
  "adaptability_score": 0-100,
  "authenticity_signals": ["..."],
  "red_flags": ["..."],
  "psychological_summary": "2 sentences",
  "cultural_alignment_score": 0-100,
  "ai_generated_risk": 0-1,
  "generic_answer_risk": 0-1,
  "personality_profile": "one line archetype label"
}}"""
        start = time.perf_counter()
        try:
            data = self._client.generate_json(
                system_instruction=CULTURE_SYSTEM,
                user_prompt=prompt,
                model_name=self._model,
                temperature=0.35,
                max_output_tokens=1024,
            )
            insights = CultureFitInsights.model_validate(data)
            logger.info("Culture fit OK %.0fms", (time.perf_counter() - start) * 1000)
            return insights
        except Exception as exc:
            logger.warning("Culture fit Gemini failed: %s", exc)
            return self._heuristic(candidate_answer, content_analysis)

    @staticmethod
    def _heuristic(
        answer: str,
        content: ContentAnalysisResult | None,
    ) -> CultureFitInsights:
        length = len(answer.split())
        startup_fit = min(100, 40 + length // 3)
        if content:
            return CultureFitInsights(
                startup_fit_score=startup_fit,
                adaptability_score=content.communication_quality,
                cultural_alignment_score=(content.cultural_fit + content.authenticity) / 2,
                ai_generated_risk=content.ai_generated_probability,
                generic_answer_risk=content.generic_response_probability,
                psychological_summary=content.summary[:200] if content.summary else "",
                personality_profile="pending_deep_analysis",
            )
        return CultureFitInsights(startup_fit_score=startup_fit, personality_profile="pending")

    @staticmethod
    def merge_into_scores(scores: dict[str, Any], insights: CultureFitInsights) -> dict[str, Any]:
        """Blend culture layer into live scoring dimensions."""
        dimensions = dict(scores.get("dimensions") or {})
        dimensions["cultural_alignment"] = insights.cultural_alignment_score
        dimensions["startup_fit"] = insights.startup_fit_score
        dimensions["adaptability"] = insights.adaptability_score

        authenticity = scores.get("authenticity_score", 50.0)
        penalty = (insights.ai_generated_risk * 15) + (insights.generic_answer_risk * 10)
        scores["authenticity_score"] = max(0, min(100, authenticity - penalty + 5))

        red = list(scores.get("red_flags") or [])
        for flag in insights.red_flags[:3]:
            if flag not in red:
                red.append(flag)
        scores["red_flags"] = red
        scores["dimensions"] = dimensions
        scores["culture_insights"] = insights.model_dump()
        return scores


_culture_agent: CultureFitAgent | None = None


def get_culture_fit_agent() -> CultureFitAgent:
    global _culture_agent
    if _culture_agent is None:
        _culture_agent = CultureFitAgent()
    return _culture_agent
