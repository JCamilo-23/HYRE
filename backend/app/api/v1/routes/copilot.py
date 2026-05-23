from fastapi import APIRouter, Depends
from app.api.v1.schemas import CopilotRequest, CopilotResponse
from app.core.auth import get_current_user, get_supabase
from app.infrastructure.openai.client import OpenAIClient
import uuid

router = APIRouter()
_openai = OpenAIClient()

SYSTEM_PROMPT = """Eres un coach de carrera experto que ayuda a candidatos a prepararse para entrevistas de trabajo.
Proporciona feedback constructivo, tips específicos y practica preguntas de entrevista en español.
Sé directo, motivador y profesional."""


@router.post("/message", response_model=CopilotResponse)
async def send_message(body: CopilotRequest, current_user=Depends(get_current_user)):
    supabase = get_supabase()
    session_id = body.session_id or str(uuid.uuid4())

    # Load or create session
    result = supabase.client.table("copilot_sessions")\
        .select("messages")\
        .eq("id", session_id)\
        .eq("user_id", str(current_user.id))\
        .execute()

    messages = result.data[0]["messages"] if result.data else []
    messages.append({"role": "user", "content": body.message})

    # Call OpenAI
    response = await _openai.client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "system", "content": SYSTEM_PROMPT}, *messages],
        max_tokens=500,
    )
    reply = response.choices[0].message.content
    messages.append({"role": "assistant", "content": reply})

    # Persist session
    if result.data:
        supabase.client.table("copilot_sessions")\
            .update({"messages": messages})\
            .eq("id", session_id)\
            .execute()
    else:
        supabase.client.table("copilot_sessions").insert({
            "id": session_id,
            "user_id": str(current_user.id),
            "messages": messages,
        }).execute()

    return CopilotResponse(session_id=session_id, reply=reply)
