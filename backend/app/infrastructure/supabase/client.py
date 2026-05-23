from supabase import create_client, Client
from app.core.config import settings


class SupabaseClient:
    def __init__(self):
        self.client: Client = create_client(
            settings.SUPABASE_URL,
            settings.SUPABASE_SERVICE_ROLE_KEY,
        )
