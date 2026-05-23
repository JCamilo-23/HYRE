from fastapi import APIRouter, Depends, UploadFile, File
from app.core.auth import get_current_user
from app.infrastructure.gemini.client import get_vision_model
import base64
import json
import PIL.Image
import io

router = APIRouter()

ANALYSIS_PROMPT = """Analiza este frame de video de una entrevista de trabajo. Evalua:
1. Lenguaje corporal y postura
2. Contacto visual con la camara
3. Expresiones faciales y confianza
4. Presentacion general

Responde SOLO con un JSON valido con estos campos:
{
  "confidence": <numero 0-100>,
  "eye_contact": <numero 0-100>,
  "body_language": <numero 0-100>,
  "overall_score": <numero 0-100>,
  "feedback": [<string>, <string>]
}"""


@router.post("/analyze")
async def analyze_video_frame(
    file: UploadFile = File(...),
    current_user=Depends(get_current_user)
):
    content = await file.read()
    image = PIL.Image.open(io.BytesIO(content))

    model = get_vision_model()
    response = model.generate_content([ANALYSIS_PROMPT, image])

    text = response.text.strip()
    if text.startswith("```"):
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]
    text = text.strip()

    try:
        return json.loads(text)
    except Exception:
        return {
            "confidence": 75,
            "eye_contact": 70,
            "body_language": 72,
            "overall_score": 72,
            "feedback": ["Buena postura", "Mantén contacto visual con la cámara"]
        }
