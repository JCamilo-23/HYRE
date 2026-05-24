"""Redis client for pub/sub, caching, and rate limiting."""

from __future__ import annotations

import json
import logging
from functools import lru_cache
from typing import Any

from app.core.config import settings

logger = logging.getLogger(__name__)


class RedisClient:
    def __init__(self, url: str) -> None:
        import redis

        self._client = redis.from_url(url, decode_responses=True)
        self._pubsub = None

    def publish(self, channel: str, message: dict[str, Any]) -> int:
        return self._client.publish(channel, json.dumps(message, default=str))

    def set_cache(self, key: str, value: dict[str, Any], ttl_seconds: int = 300) -> None:
        self._client.setex(key, ttl_seconds, json.dumps(value, default=str))

    def get_cache(self, key: str) -> dict[str, Any] | None:
        raw = self._client.get(key)
        if not raw:
            return None
        return json.loads(raw)

    def incr_rate_limit(self, key: str, window_seconds: int = 60) -> int:
        pipe = self._client.pipeline()
        pipe.incr(key)
        pipe.expire(key, window_seconds)
        results = pipe.execute()
        return int(results[0])

    def ping(self) -> bool:
        try:
            return bool(self._client.ping())
        except Exception:
            return False


@lru_cache
def get_redis() -> RedisClient | None:
    if not settings.REDIS_URL:
        return None
    try:
        client = RedisClient(settings.REDIS_URL)
        if client.ping():
            return client
    except Exception as exc:
        logger.warning("Redis unavailable: %s", exc)
    return None
