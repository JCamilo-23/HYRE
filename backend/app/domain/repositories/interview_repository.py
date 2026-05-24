"""Interview persistence — Supabase with in-memory fallback."""

from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import Any, Protocol
from uuid import UUID

from app.core.config import settings

logger = logging.getLogger(__name__)


class InterviewRepository(Protocol):
    def create(
        self,
        *,
        session_id: str,
        candidate_id: str,
        recruiter_id: str | None,
        job_id: str | None,
        metadata: dict[str, Any],
    ) -> None: ...

    def update_status(self, session_id: str, status: str, *, ended_at: str | None = None) -> None: ...

    def append_message(
        self,
        session_id: str,
        *,
        role: str,
        content: str,
        transcript_confidence: float | None = None,
        metadata: dict[str, Any] | None = None,
    ) -> None: ...

    def record_event(
        self,
        session_id: str,
        *,
        event_type: str,
        payload: dict[str, Any],
        latency_ms: int | None = None,
    ) -> None: ...

    def save_score(self, session_id: str, score: dict[str, Any]) -> None: ...

    def save_analytics(
        self,
        session_id: str,
        *,
        analyzer: str,
        raw_output: dict[str, Any],
        latency_ms: int | None = None,
        tokens_used: int = 0,
    ) -> None: ...

    def save_training_row(
        self,
        session_id: str,
        *,
        feature_vector: dict[str, Any],
        label: dict[str, Any],
    ) -> None: ...


class NoOpInterviewRepository:
    """Used when Supabase is not configured."""

    def create(self, **kwargs: Any) -> None:
        return None

    def update_status(self, session_id: str, status: str, *, ended_at: str | None = None) -> None:
        return None

    def append_message(self, session_id: str, **kwargs: Any) -> None:
        return None

    def record_event(self, session_id: str, **kwargs: Any) -> None:
        return None

    def save_score(self, session_id: str, score: dict[str, Any]) -> None:
        return None

    def save_analytics(self, session_id: str, **kwargs: Any) -> None:
        return None

    def save_training_row(self, session_id: str, **kwargs: Any) -> None:
        return None


class SupabaseInterviewRepository:
    """Persists interview engine data to Supabase/Postgres."""

    def __init__(self) -> None:
        from app.infrastructure.supabase.client import SupabaseClient

        self._client = SupabaseClient().client

    def create(
        self,
        *,
        session_id: str,
        candidate_id: str,
        recruiter_id: str | None,
        job_id: str | None,
        metadata: dict[str, Any],
    ) -> None:
        row = {
            "id": session_id,
            "candidate_id": candidate_id,
            "recruiter_id": recruiter_id,
            "job_id": job_id,
            "status": "live",
            "mode": "live",
            "started_at": datetime.now(timezone.utc).isoformat(),
            "metadata": metadata,
        }
        self._client.table("interviews").upsert(row).execute()

    def update_status(self, session_id: str, status: str, *, ended_at: str | None = None) -> None:
        patch: dict[str, Any] = {
            "status": status,
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }
        if ended_at:
            patch["ended_at"] = ended_at
        self._client.table("interviews").update(patch).eq("id", session_id).execute()

    def append_message(
        self,
        session_id: str,
        *,
        role: str,
        content: str,
        transcript_confidence: float | None = None,
        metadata: dict[str, Any] | None = None,
    ) -> None:
        self._client.table("interview_messages").insert(
            {
                "interview_id": session_id,
                "role": role,
                "content": content,
                "transcript_confidence": transcript_confidence,
                "metadata": metadata or {},
            }
        ).execute()

    def record_event(
        self,
        session_id: str,
        *,
        event_type: str,
        payload: dict[str, Any],
        latency_ms: int | None = None,
    ) -> None:
        self._client.table("interview_events").insert(
            {
                "interview_id": session_id,
                "event_type": event_type,
                "payload": payload,
                "latency_ms": latency_ms,
            }
        ).execute()

    def save_score(self, session_id: str, score: dict[str, Any]) -> None:
        self._client.table("candidate_scores").upsert(
            {
                "interview_id": session_id,
                "overall_score": score["overall_score"],
                "hire_probability": score["hire_probability"],
                "skill_match_pct": score["skill_match_pct"],
                "confidence_score": score["confidence_score"],
                "authenticity_score": score["authenticity_score"],
                "content_score": score["content_score"],
                "audio_score": score["audio_score"],
                "facial_score": score["facial_score"],
                "dimensions": score.get("dimensions", {}),
                "recommendation": score["recommendation"],
                "red_flags": score.get("red_flags", []),
            },
            on_conflict="interview_id",
        ).execute()

    def save_analytics(
        self,
        session_id: str,
        *,
        analyzer: str,
        raw_output: dict[str, Any],
        latency_ms: int | None = None,
        tokens_used: int = 0,
    ) -> None:
        self._client.table("ai_analytics").insert(
            {
                "interview_id": session_id,
                "analyzer": analyzer,
                "raw_output": raw_output,
                "latency_ms": latency_ms,
                "tokens_used": tokens_used,
            }
        ).execute()

    def save_training_row(
        self,
        session_id: str,
        *,
        feature_vector: dict[str, Any],
        label: dict[str, Any],
    ) -> None:
        self._client.table("ml_training_data").insert(
            {
                "interview_id": session_id,
                "feature_vector": feature_vector,
                "label": label,
                "source": "production",
            }
        ).execute()


_repo: InterviewRepository | None = None


def get_interview_repository() -> InterviewRepository:
    global _repo
    if _repo is not None:
        return _repo
    if settings.SUPABASE_URL and settings.SUPABASE_SERVICE_ROLE_KEY:
        try:
            _repo = SupabaseInterviewRepository()
            logger.info("Interview repository: Supabase")
            return _repo
        except Exception as exc:
            logger.warning("Supabase interview repo unavailable: %s", exc)
    _repo = NoOpInterviewRepository()
    logger.info("Interview repository: no-op (configure SUPABASE_URL for persistence)")
    return _repo
