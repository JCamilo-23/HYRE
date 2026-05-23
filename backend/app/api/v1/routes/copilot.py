from fastapi import APIRouter, Depends
from app.api.v1.schemas import CopilotRequest, CopilotResponse
from app.core.auth import get_current_user, get_supabase
from app.infrastructure.gemini.client import get_text_model
import uuid

router = APIRouter()

SYSTEM_PROMPT = """Eres HYRE Coach, un mentor de carrera experto para jovenes Gen Z que buscan trabajo.
Ayudas a prepararse para entrevistas, mejorar el CV y desarrollar habilidades profesionales.
Eres directo, motivador, usas lenguaje moderno pero profesional. Respondes siempre en español.
Maximo 3 parrafos por respuesta."""


@router.post("/message", response_model=CopilotResponse)
async def send_message(body: CopilotRequest, current_user=Depends(get_current_user)):
    supabase = get_supabase()
    session_id = body.session_id or str(uuid.uuid4())

    result = supabase.client.table("copilot_sessions")\
        .select("messages")\
        .eq("id", session_id)\
        .eq("user_id", str(current_user.id))\
        .execute()

    history = result.data[0]["messages"] if result.data else []
    history.append({"role": "user", "content": body.message})

    model = get_text_model()
    chat_history = [
        {"role": "user" if m["role"] == "user" else "model", "parts": [m["content"]]}
        for m in history[:-1]
    ]
    chat = model.start_chat(history=chat_history)
    response = chat.send_message(f"{SYSTEM_PROMPT}\n\nUsuario: {body.message}")
    reply = response.text

    history.append({"role": "assistant", "content": reply})

    if result.data:
        supabase.client.table("copilot_sessions")\
            .update({"messages": history})\
            .eq("id", session_id).execute()
    else:
        supabase.client.table("copilot_sessions").insert({
            "id": session_id,
            "user_id": str(current_user.id),
            "messages": history,
        }).execute()

    return CopilotResponse(session_id=session_id, reply=reply)
