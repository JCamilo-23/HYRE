from fastapi import APIRouter, Depends, UploadFile, File
from app.core.auth import get_current_user
from app.infrastructure.openai.client import OpenAIClient
import base64

router = APIRouter()
_openai = OpenAIClient()

ANALYSIS_PROMPT = """Analiza este frame de video de una entrevista de trabajo. Evalúa:
1. Lenguaje corporal y postura
2. Contacto visual con la cámara
3. Expresiones faciales y confianza
4. Presentación general

Responde en JSON con: confidence (0-100), eye_contact (0-100), body_language (0-100), overall_score (0-100), feedback (lista de strings)."""


@router.post("/analyze")
async def analyze_video_frame(
    file: UploadFile = File(...),
    current_user=Depends(get_current_user)
):
    content = await file.read()
    b64 = base64.b64encode(content).decode()
    mime = file.content_type or "image/jpeg"

    response = await _openai.client.chat.completions.create(
        model="gpt-4o",
        messages=[{
            "role": "user",
            "content": [
                {"type": "text", "text": ANALYSIS_PROMPT},
                {"type": "image_url", "image_url": {"url": f"data:{mime};base64,{b64}"}},
            ],
        }],
        response_format={"type": "json_object"},
        max_tokens=300,
    )

    import json
    return json.loads(response.choices[0].message.content)
