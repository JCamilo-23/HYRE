"""FastAPI dependency injection."""

from functools import lru_cache

from app.domain.services.ai_chat import AIChatService
from app.domain.use_cases.work_simulator import WorkSimulatorUseCase
from app.infrastructure.gemini.chat_adapter import GeminiChatAdapter
from app.infrastructure.gemini.client import get_gemini_client
from app.infrastructure.supabase.client import SupabaseClient


@lru_cache
def get_ai_chat_service() -> AIChatService:
    return GeminiChatAdapter(get_gemini_client())


@lru_cache
def get_work_simulator_use_case() -> WorkSimulatorUseCase:
    from app.core.config import settings

    supabase = SupabaseClient()
    return WorkSimulatorUseCase(
        get_ai_chat_service(),
        supabase.client,
        pro_model=settings.GEMINI_PRO_MODEL,
    )
