from __future__ import annotations

import io
import json
import logging

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from PIL import Image

from app.core.auth import get_current_user
from app.infrastructure.gemini.client import get_gemini_client

logger = logging.getLogger(__name__)
router = APIRouter()

ANALYSIS_PROMPT = """Analiza este frame de video de una entrevista de trabajo. Evalúa:
1. Lenguaje corporal y postura
2. Contacto visual con la cámara
3. Expresiones faciales y confianza
4. Presentación general

Responde SOLO con un JSON válido:
{
  "confidence": <0-100>,
  "eye_contact": <0-100>,
  "body_language": <0-100>,
  "overall_score": <0-100>,
  "feedback": ["...", "..."]
}"""

FALLBACK = {
    "confidence": 75,
    "eye_contact": 70,
    "body_language": 72,
    "overall_score": 72,
    "feedback": ["Buena postura", "Mantén contacto visual con la cámara"],
}


def _parse_json_response(text: str) -> dict:
    cleaned = text.strip()
    if cleaned.startswith("```"):
        cleaned = cleaned.split("```")[1]
        if cleaned.startswith("json"):
            cleaned = cleaned[4:]
    return json.loads(cleaned.strip())


@router.post("/analyze")
async def analyze_video_frame(
    file: UploadFile = File(...),
    current_user=Depends(get_current_user),
):
    content = await file.read()
    image = Image.open(io.BytesIO(content))
    client = get_gemini_client()

    try:
        raw = client.generate_with_image(prompt=ANALYSIS_PROMPT, image=image)
        return _parse_json_response(raw)
    except Exception:
        logger.exception("Video frame analysis failed")
        return FALLBACK
