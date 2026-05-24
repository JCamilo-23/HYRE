"""Hot session store — memory + optional Redis cache."""

from __future__ import annotations

import json
import logging
from typing import Any

from app.core.config import settings
from app.infrastructure.redis.client import get_redis

logger = logging.getLogger(__name__)

_CACHE_PREFIX = "interview:session:"
_CACHE_TTL = 3600


class InterviewSessionStore:
    def __init__(self) -> None:
        self._memory: dict[str, dict[str, Any]] = {}

    def get(self, session_id: str) -> dict[str, Any] | None:
        if session_id in self._memory:
            return self._memory[session_id]
        redis = get_redis()
        if redis:
            cached = redis.get_cache(f"{_CACHE_PREFIX}{session_id}")
            if cached:
                self._memory[session_id] = cached
                return cached
        return None

    def set(self, session_id: str, data: dict[str, Any]) -> None:
        self._memory[session_id] = data
        redis = get_redis()
        if redis:
            try:
                redis.set_cache(f"{_CACHE_PREFIX}{session_id}", data, _CACHE_TTL)
            except Exception as exc:
                logger.debug("Redis session cache write failed: %s", exc)

    def delete(self, session_id: str) -> None:
        self._memory.pop(session_id, None)


_store: InterviewSessionStore | None = None


def get_session_store() -> InterviewSessionStore:
    global _store
    if _store is None:
        _store = InterviewSessionStore()
    return _store
