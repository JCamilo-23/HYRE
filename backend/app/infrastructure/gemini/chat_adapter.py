"""Adapts GeminiClient to the domain AIChatService port."""

from app.domain.services.ai_chat import AIChatService
from app.infrastructure.gemini.client import GeminiClient


class GeminiChatAdapter(AIChatService):
    def __init__(self, client: GeminiClient) -> None:
        self._client = client

    def generate_text(
        self,
        *,
        system_instruction: str,
        user_prompt: str,
        model_name: str | None = None,
    ) -> str:
        return self._client.generate_text(
            system_instruction=system_instruction,
            user_prompt=user_prompt,
            model_name=model_name,
        )

    def generate_json(
        self,
        *,
        system_instruction: str,
        user_prompt: str,
        model_name: str | None = None,
    ) -> dict:
        return self._client.generate_json(
            system_instruction=system_instruction,
            user_prompt=user_prompt,
            model_name=model_name,
        )

    def chat(
        self,
        *,
        system_instruction: str,
        history: list[dict[str, str]],
        user_message: str,
        model_name: str | None = None,
    ) -> str:
        return self._client.chat(
            system_instruction=system_instruction,
            history=history,
            user_message=user_message,
            model_name=model_name,
        )
