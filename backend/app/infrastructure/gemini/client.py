"""Low-level Google Gemini SDK wrapper."""

from __future__ import annotations

import json
import logging
import re
from functools import lru_cache
from typing import Any

import google.generativeai as genai
from google.generativeai.types import ContentDict

from app.core.config import settings

logger = logging.getLogger(__name__)

_JSON_FENCE = re.compile(r"^```(?:json)?\s*|\s*```$", re.MULTILINE)


def _strip_json_fences(text: str) -> str:
    return _JSON_FENCE.sub("", text).strip()


class GeminiClient:
    """Thread-safe facade over the Gemini Python SDK."""

    def __init__(self, api_key: str, default_model: str) -> None:
        genai.configure(api_key=api_key)
        self._default_model = default_model

    def _model(
        self,
        model_name: str | None = None,
        system_instruction: str | None = None,
    ) -> genai.GenerativeModel:
        kwargs: dict[str, Any] = {}
        if system_instruction:
            kwargs["system_instruction"] = system_instruction
        return genai.GenerativeModel(model_name or self._default_model, **kwargs)

    def generate_text(
        self,
        *,
        system_instruction: str,
        user_prompt: str,
        model_name: str | None = None,
        temperature: float = 0.7,
        max_output_tokens: int = 2048,
    ) -> str:
        model = self._model(model_name, system_instruction=system_instruction)
        response = model.generate_content(
            user_prompt,
            generation_config=genai.GenerationConfig(
                temperature=temperature,
                max_output_tokens=max_output_tokens,
            ),
        )
        text = (response.text or "").strip()
        if not text:
            logger.warning("Gemini returned empty text for prompt")
        return text

    def generate_json(
        self,
        *,
        system_instruction: str,
        user_prompt: str,
        model_name: str | None = None,
        temperature: float = 0.4,
    ) -> dict[str, Any]:
        raw = self.generate_text(
            system_instruction=system_instruction,
            user_prompt=user_prompt + "\n\nResponde ÚNICAMENTE con JSON válido, sin markdown.",
            model_name=model_name,
            temperature=temperature,
        )
        cleaned = _strip_json_fences(raw)
        try:
            return json.loads(cleaned)
        except json.JSONDecodeError as exc:
            logger.error("Failed to parse Gemini JSON: %s", exc)
            raise ValueError("Invalid JSON from Gemini") from exc

    def chat(
        self,
        *,
        system_instruction: str,
        history: list[dict[str, str]],
        user_message: str,
        model_name: str | None = None,
        temperature: float = 0.75,
        max_output_tokens: int = 2048,
    ) -> str:
        """Multi-turn chat with role mapping user -> user, assistant -> model."""
        model = self._model(model_name, system_instruction=system_instruction)
        gemini_history: list[ContentDict] = []
        for msg in history[:-1] if history and history[-1].get("role") == "user" else history:
            role = "user" if msg["role"] == "user" else "model"
            gemini_history.append({"role": role, "parts": [msg["content"]]})

        chat = model.start_chat(
            history=gemini_history,
            enable_automatic_function_calling=False,
        )
        response = chat.send_message(
            user_message,
            generation_config=genai.GenerationConfig(
                temperature=temperature,
                max_output_tokens=max_output_tokens,
            ),
        )
        return (response.text or "").strip()

    def generate_with_image(
        self,
        *,
        prompt: str,
        image: Any,
        model_name: str | None = None,
    ) -> str:
        model = self._model(model_name)
        response = model.generate_content([prompt, image])
        return (response.text or "").strip()


@lru_cache
def get_gemini_client() -> GeminiClient:
    return GeminiClient(
        api_key=settings.GEMINI_API_KEY,
        default_model=settings.GEMINI_MODEL,
    )
