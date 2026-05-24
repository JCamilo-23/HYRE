"""Low-level Google Gemini SDK wrapper."""

from __future__ import annotations

import json
import logging
import re
import time
from functools import lru_cache
from typing import Any

import google.generativeai as genai
from google.generativeai.types import ContentDict

from app.core.config import settings

logger = logging.getLogger(__name__)

_JSON_FENCE = re.compile(r"^```(?:json)?\s*|\s*```$", re.MULTILINE)
_MAX_RETRIES = 3
_RETRY_DELAY_S = 0.6


def _strip_json_fences(text: str) -> str:
    return _JSON_FENCE.sub("", text).strip()


class GeminiClient:
    """Thread-safe facade over the Gemini Python SDK."""

    def __init__(self, api_key: str, default_model: str) -> None:
        if not api_key:
            raise ValueError("GeminiClient requires a non-empty api_key")
        genai.configure(api_key=api_key)
        self._default_model = default_model
        self._api_key_prefix = api_key[:8] + "..."

    def _model(
        self,
        model_name: str | None = None,
        system_instruction: str | None = None,
    ) -> genai.GenerativeModel:
        kwargs: dict[str, Any] = {}
        if system_instruction:
            kwargs["system_instruction"] = system_instruction
        return genai.GenerativeModel(model_name or self._default_model, **kwargs)

    def _model_candidates(self, model_name: str | None) -> list[str]:
        primary = model_name or self._default_model
        candidates: list[str] = []
        for mid in [primary, *settings.GEMINI_FALLBACK_MODELS]:
            if mid and mid not in candidates:
                candidates.append(mid)
        return candidates

    def generate_text(
        self,
        *,
        system_instruction: str,
        user_prompt: str,
        model_name: str | None = None,
        temperature: float = 0.7,
        max_output_tokens: int = 2048,
    ) -> str:
        candidates = self._model_candidates(model_name)
        last_error: Exception | None = None

        for model_id in candidates:
            for attempt in range(1, _MAX_RETRIES + 1):
                try:
                    model = self._model(model_id, system_instruction=system_instruction)
                    response = model.generate_content(
                        user_prompt,
                        generation_config=genai.GenerationConfig(
                            temperature=temperature,
                            max_output_tokens=max_output_tokens,
                        ),
                    )
                    text = (response.text or "").strip()
                    if not text:
                        raise ValueError(f"Gemini model {model_id} returned empty text")
                    logger.info(
                        "Gemini generate_text OK model=%s attempt=%d key=%s",
                        model_id,
                        attempt,
                        self._api_key_prefix,
                    )
                    return text
                except Exception as exc:
                    last_error = exc
                    err = str(exc)
                    logger.error(
                        "Gemini FAILED model=%s attempt=%d/%d: %s",
                        model_id,
                        attempt,
                        _MAX_RETRIES,
                        err[:400],
                    )
                    if "429" in err or "quota" in err.lower() or "404" in err:
                        break
                    if attempt < _MAX_RETRIES:
                        time.sleep(_RETRY_DELAY_S * attempt)

        raise RuntimeError(
            f"Gemini API failed for models {candidates}: {last_error}"
        ) from last_error

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
            logger.error("Failed to parse Gemini JSON: %s raw=%s", exc, raw[:500])
            raise ValueError(f"Invalid JSON from Gemini: {exc}") from exc

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
    if not settings.GEMINI_API_KEY:
        raise ValueError("GEMINI_API_KEY missing — cannot create GeminiClient")
    return GeminiClient(
        api_key=settings.GEMINI_API_KEY,
        default_model=settings.GEMINI_MODEL,
    )
