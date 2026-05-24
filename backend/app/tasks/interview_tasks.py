"""Celery tasks for heavy interview analysis workloads."""

from __future__ import annotations

import logging
from typing import Any

from app.infrastructure.celery_app import celery_app
from app.domain.services.interview_orchestrator import get_interview_orchestrator
from app.infrastructure.analysis.audio_analyzer import AudioAnalyzer
from app.infrastructure.analysis.facial_analyzer import FacialAnalyzer

logger = logging.getLogger(__name__)


@celery_app.task(name="interview.process_audio", bind=True, max_retries=3)
def process_audio_task(self, session_id: str, audio_b64: str) -> dict[str, Any]:
    import base64

    try:
        audio_bytes = base64.b64decode(audio_b64)
        analyzer = AudioAnalyzer()
        result = analyzer.analyze(audio_bytes)
        redis = _get_redis_optional()
        if redis:
            redis.set_cache(f"interview:{session_id}:audio", result.model_dump(), 3600)
        return result.model_dump()
    except Exception as exc:
        logger.exception("process_audio_task failed")
        raise self.retry(exc=exc, countdown=2 ** self.request.retries)


@celery_app.task(name="interview.process_frames", bind=True, max_retries=3)
def process_frames_task(self, session_id: str, frames_b64: list[str]) -> dict[str, Any]:
    import base64

    try:
        frames = [base64.b64decode(f) for f in frames_b64[:8]]
        analyzer = FacialAnalyzer()
        result = analyzer.analyze_frames(frames)
        redis = _get_redis_optional()
        if redis:
            redis.set_cache(f"interview:{session_id}:facial", result.model_dump(), 3600)
        return result.model_dump()
    except Exception as exc:
        logger.exception("process_frames_task failed")
        raise self.retry(exc=exc, countdown=2 ** self.request.retries)


@celery_app.task(name="interview.finalize", bind=True, max_retries=2)
def finalize_interview_task(self, session_id: str) -> dict[str, Any]:
    import asyncio

    orchestrator = get_interview_orchestrator()

    async def _run() -> dict[str, Any]:
        return await orchestrator.finalize_session(session_id)

    try:
        return asyncio.get_event_loop().run_until_complete(_run())
    except RuntimeError:
        return asyncio.run(_run())
    except Exception as exc:
        logger.exception("finalize_interview_task failed")
        raise self.retry(exc=exc, countdown=5)


def _get_redis_optional():
    from app.infrastructure.redis.client import get_redis

    return get_redis()
