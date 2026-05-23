from openai import AsyncOpenAI
from app.core.config import settings


class OpenAIClient:
    def __init__(self):
        self.client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
