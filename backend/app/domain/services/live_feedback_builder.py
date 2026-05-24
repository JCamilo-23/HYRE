"""Structured realtime feedback derived from content analysis (no extra LLM latency)."""

from __future__ import annotations

from app.domain.entities.interview import ContentAnalysisResult
from app.domain.entities.interview_report import LiveFeedback


def build_live_feedback(
    content: ContentAnalysisResult,
    *,
    scores: dict | None = None,
) -> LiveFeedback:
    scores = scores or {}
    strengths: list[str] = []
    improvements: list[str] = []

    if content.technical_depth >= 72:
        strengths.append("Demostraste sólida profundidad técnica en tu respuesta.")
    elif content.technical_depth >= 55:
        strengths.append("Buen nivel técnico; puedes profundizar con ejemplos concretos.")
    else:
        improvements.append("Añade más detalle técnico: herramientas, métricas y tradeoffs.")

    if content.communication_quality >= 70:
        strengths.append("Comunicación clara y estructurada.")
    elif content.communication_quality < 50:
        improvements.append("Estructura la respuesta: contexto → acción → resultado.")

    if content.reasoning_depth >= 68:
        strengths.append("Buen razonamiento y pensamiento analítico.")
    elif content.reasoning_depth < 45:
        improvements.append("Explica el «por qué» detrás de tus decisiones.")

    if content.relevance >= 75:
        strengths.append("Respuesta muy alineada con la pregunta.")
    elif content.relevance < 50:
        improvements.append("Enfócate más directamente en lo que se preguntó.")

    if content.leadership >= 65:
        strengths.append("Se percibe ownership y liderazgo.")

    if content.detected_skills:
        strengths.append(
            f"Habilidades evidenciadas: {', '.join(content.detected_skills[:4])}."
        )

    for flag in content.red_flags[:2]:
        if flag and flag not in improvements:
            improvements.append(flag)

    if content.generic_response_probability > 0.65:
        improvements.append("Personaliza con una historia real tuya, no respuestas genéricas.")

    if content.ai_generated_probability > 0.6:
        improvements.append("Usa ejemplos vividos y específicos para sonar más auténtico.")

    hire_prob = float(scores.get("hire_probability", 0))
    if hire_prob >= 75 and not strengths:
        strengths.append("Vas por buen camino según el scoring en vivo.")

    headline = content.summary[:200] if content.summary else "Análisis de tu última respuesta"
    if not strengths and not improvements:
        improvements.append("Sigue desarrollando tu respuesta con ejemplos medibles.")

    return LiveFeedback(
        headline=headline,
        strengths=strengths[:4],
        improvements=improvements[:4],
        highlight_skills=list(content.detected_skills[:6]),
        communication_note=_band(content.communication_quality),
        technical_note=_band(content.technical_depth),
    )


def _band(value: float) -> str:
    if value >= 75:
        return "excelente"
    if value >= 60:
        return "bueno"
    if value >= 45:
        return "mejorable"
    return "necesita refuerzo"
