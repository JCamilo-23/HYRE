"""Gemini Pro real-time content analyzer for interview answers."""

from __future__ import annotations

import logging
import time
from typing import Any, Sequence

from app.core.config import settings
from app.domain.entities.interview import ContentAnalysisResult, MessageRole
from app.infrastructure.gemini.client import GeminiClient, get_gemini_client

logger = logging.getLogger(__name__)

SYSTEM_INSTRUCTION = """Eres el motor de evaluación de entrevistas de HYRE.
Analizas respuestas de candidatos en tiempo real con precisión, sin sesgos discriminatorios.
Evalúa evidencia en el texto, no suposiciones. Responde SOLO JSON válido en español para campos de texto."""

ANALYSIS_PROMPT_TEMPLATE = """Contexto del puesto:
{job_context}

Habilidades requeridas: {required_skills}

Historial reciente de la entrevista:
{history}

Última respuesta del candidato:
{candidate_answer}

Analiza y devuelve JSON con esta estructura exacta:
{{
  "technical_depth": 0-100,
  "communication_quality": 0-100,
  "relevance": 0-100,
  "reasoning_depth": 0-100,
  "leadership": 0-100,
  "cultural_fit": 0-100,
  "authenticity": 0-100,
  "generic_response_probability": 0-1,
  "ai_generated_probability": 0-1,
  "contradictions": ["..."],
  "detected_skills": ["..."],
  "soft_skills": ["..."],
  "summary": "2 oraciones",
  "red_flags": ["..."]
}}"""


class GeminiInterviewAnalyzer:
    """Low-latency Gemini Pro analyzer optimized for <500ms perceived latency."""

    def __init__(
        self,
        client: GeminiClient | None = None,
        pro_model: str | None = None,
    ) -> None:
        self._client = client or get_gemini_client()
        self._pro_model = pro_model or settings.GEMINI_PRO_MODEL

    def analyze_answer(
        self,
        *,
        candidate_answer: str,
        history: Sequence[dict[str, str]],
        job_context: str = "",
        required_skills: Sequence[str] | None = None,
    ) -> ContentAnalysisResult:
        if not settings.GEMINI_API_KEY:
            raise ValueError("GEMINI_API_KEY is not configured")

        start = time.perf_counter()
        history_text = "\n".join(
            f"{m.get('role', 'user')}: {m.get('content', '')[:500]}"
            for m in history[-6:]
        )
        prompt = ANALYSIS_PROMPT_TEMPLATE.format(
            job_context=job_context or "Rol general tecnología",
            required_skills=", ".join(required_skills or ["comunicación", "trabajo en equipo"]),
            history=history_text or "(inicio de entrevista)",
            candidate_answer=candidate_answer[:4000],
        )

        try:
            data = self._client.generate_json(
                system_instruction=SYSTEM_INSTRUCTION,
                user_prompt=prompt,
                model_name=self._pro_model,
                temperature=0.35,
            )
            result = ContentAnalysisResult.model_validate(data)
            elapsed = (time.perf_counter() - start) * 1000
            logger.info("Gemini content analysis %.0fms", elapsed)
            return result
        except Exception as exc:
            logger.exception("Gemini interview analysis failed: %s", exc)
            if settings.REQUIRE_GEMINI:
                raise RuntimeError(f"Gemini analysis failed: {exc}") from exc
            return self._heuristic_fallback(candidate_answer)

    def stream_coaching_hint(
        self,
        *,
        candidate_answer: str,
        stress_level: float = 0.0,
    ) -> str:
        """Short realtime coaching line for candidate UI."""
        prompt = (
            f"Respuesta del candidato: {candidate_answer[:800]}\n"
            f"Nivel de estrés detectado: {stress_level:.0f}/100\n"
            "Da UN consejo breve (máx 20 palabras) para mejorar su siguiente respuesta."
        )
        try:
            return self._client.generate_text(
                system_instruction="Eres coach de entrevistas HYRE. Español. Muy breve.",
                user_prompt=prompt,
                model_name=settings.GEMINI_MODEL,
                temperature=0.6,
                max_output_tokens=80,
            )
        except Exception:
            return "Respira, estructura tu respuesta: contexto, acción, resultado."

    def generate_next_question(
        self,
        *,
        history: Sequence[dict[str, str]],
        job_context: str,
        difficulty: str = "medium",
        emotion_hint: str = "neutral",
    ) -> str:
        prompt = f"""Genera la siguiente pregunta de entrevista.
Puesto: {job_context}
Dificultad: {difficulty}
Estado emocional candidato: {emotion_hint}
Historial: {history[-4:] if history else 'ninguno'}
Una sola pregunta, español, máximo 2 oraciones."""
        try:
            return self._client.generate_text(
                system_instruction="Eres entrevistador IA profesional de HYRE.",
                user_prompt=prompt,
                model_name=self._pro_model,
                temperature=0.75,
                max_output_tokens=150,
            )
        except Exception:
            return "Cuéntame un reto técnico reciente y cómo lo resolviste."

    @staticmethod
    def _heuristic_fallback(answer: str) -> ContentAnalysisResult:
        length = len(answer.split())
        depth = min(100, 30 + length * 2)
        generic = 0.7 if length < 15 else 0.2
        return ContentAnalysisResult(
            technical_depth=depth,
            communication_quality=min(100, 40 + length),
            relevance=65.0,
            reasoning_depth=depth * 0.9,
            leadership=50.0,
            cultural_fit=60.0,
            authenticity=70.0,
            generic_response_probability=generic,
            ai_generated_probability=0.25,
            contradictions=[],
            detected_skills=[],
            soft_skills=["comunicación"],
            summary="Análisis heurístico — verificar con Gemini cuando esté disponible.",
            red_flags=["gemini_unavailable"] if length < 5 else [],
        )
