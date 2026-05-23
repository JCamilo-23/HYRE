from __future__ import annotations

import logging
import uuid

from fastapi import APIRouter, Depends, HTTPException

from app.api.v1.schemas import CopilotRequest, CopilotResponse
from app.core.auth import get_current_user, get_supabase
from app.core.dependencies import get_ai_chat_service
from app.domain.services.ai_chat import AIChatService

logger = logging.getLogger(__name__)
router = APIRouter()

SYSTEM_PROMPT = """Eres HYRE Coach, un mentor de carrera experto para jóvenes que buscan trabajo.
Ayudas a prepararse para entrevistas, mejorar el CV y desarrollar habilidades profesionales.
Eres directo, motivador y profesional. Respondes siempre en español.
Máximo 3 párrafos por respuesta."""


@router.post("/message", response_model=CopilotResponse)
async def send_message(
    body: CopilotRequest,
    current_user=Depends(get_current_user),
    ai: AIChatService = Depends(get_ai_chat_service),
):
    supabase = get_supabase()
    session_id = body.session_id or str(uuid.uuid4())

    result = (
        supabase.client.table("copilot_sessions")
        .select("messages")
        .eq("id", session_id)
        .eq("user_id", str(current_user.id))
        .execute()
    )

    messages = result.data[0]["messages"] if result.data else []
    messages.append({"role": "user", "content": body.message})

    try:
        reply = ai.chat(
            system_instruction=SYSTEM_PROMPT,
            history=messages,
            user_message=body.message,
        )
    except Exception as exc:
        logger.exception("Copilot Gemini request failed")
        raise HTTPException(status_code=502, detail="AI service unavailable") from exc

    messages.append({"role": "assistant", "content": reply})

    if result.data:
        supabase.client.table("copilot_sessions").update({"messages": messages}).eq(
            "id", session_id
        ).execute()
    else:
        supabase.client.table("copilot_sessions").insert({
            "id": session_id,
            "user_id": str(current_user.id),
            "messages": messages,
        }).execute()

    return CopilotResponse(session_id=session_id, reply=reply)
