"""Domain port for generative chat — infrastructure implements this contract."""

from __future__ import annotations

from typing import Any, Protocol


class AIChatService(Protocol):
    def generate_text(
        self,
        *,
        system_instruction: str,
        user_prompt: str,
        model_name: str | None = None,
    ) -> str: ...

    def generate_json(
        self,
        *,
        system_instruction: str,
        user_prompt: str,
        model_name: str | None = None,
    ) -> dict[str, Any]: ...

    def chat(
        self,
        *,
        system_instruction: str,
        history: list[dict[str, str]],
        user_message: str,
        model_name: str | None = None,
    ) -> str: ...
