from functools import lru_cache
from app.infrastructure.supabase.client import SupabaseClient
from app.infrastructure.openai.client import OpenAIClient


@lru_cache
def get_supabase() -> SupabaseClient:
    return SupabaseClient()


@lru_cache
def get_openai() -> OpenAIClient:
    return OpenAIClient()
