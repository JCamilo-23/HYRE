"""Real-time interview orchestration — coordinates analyzers and events."""

from __future__ import annotations

import logging
import time
import uuid
from datetime import datetime, timezone
from typing import Any, Callable, Awaitable

from app.domain.entities.interview import (
    AudioAnalysisResult,
    ContentAnalysisResult,
    FacialAnalysisResult,
    InterviewMessage,
    InterviewStatus,
    MessageRole,
)
from app.domain.repositories.interview_repository import get_interview_repository
from app.domain.services.scoring_engine import ScoringEngine
from app.infrastructure.analysis.audio_analyzer import AudioAnalyzer
from app.infrastructure.analysis.facial_analyzer import FacialAnalyzer
from app.infrastructure.gemini.interview_analyzer import GeminiInterviewAnalyzer
from app.infrastructure.session.interview_session_store import get_session_store

logger = logging.getLogger(__name__)

EventEmitter = Callable[[str, dict[str, Any]], Awaitable[None]]


class InterviewOrchestrator:
    """Event-driven pipeline: transcript → Gemini → audio/facial → scores → emit."""

    def __init__(
        self,
        *,
        gemini: GeminiInterviewAnalyzer | None = None,
        audio: AudioAnalyzer | None = None,
        facial: FacialAnalyzer | None = None,
        scoring: ScoringEngine | None = None,
    ) -> None:
        self._gemini = gemini or GeminiInterviewAnalyzer()
        self._audio = audio or AudioAnalyzer()
        self._facial = facial or FacialAnalyzer()
        self._scoring = scoring or ScoringEngine()
        self._store = get_session_store()
        self._repo = get_interview_repository()

    def create_session(
        self,
        *,
        candidate_id: str,
        job_id: str | None = None,
        recruiter_id: str | None = None,
        job_context: str = "",
        required_skills: list[str] | None = None,
    ) -> str:
        session_id = str(uuid.uuid4())
        session = {
            "id": session_id,
            "candidate_id": candidate_id,
            "recruiter_id": recruiter_id,
            "job_id": job_id,
            "status": InterviewStatus.LIVE.value,
            "job_context": job_context,
            "required_skills": required_skills or [],
            "messages": [],
            "content_results": [],
            "latest_audio": None,
            "latest_facial": None,
            "started_at": datetime.now(timezone.utc).isoformat(),
        }
        self._store.set(session_id, session)
        try:
            self._repo.create(
                session_id=session_id,
                candidate_id=candidate_id,
                recruiter_id=recruiter_id,
                job_id=job_id,
                metadata={
                    "job_context": job_context,
                    "required_skills": required_skills or [],
                },
            )
        except Exception as exc:
            logger.warning("Failed to persist interview create: %s", exc)
        return session_id

    def get_session(self, session_id: str) -> dict[str, Any] | None:
        return self._store.get(session_id)

    def _persist_session(self, session_id: str, session: dict[str, Any]) -> None:
        self._store.set(session_id, session)

    async def process_transcript(
        self,
        session_id: str,
        *,
        transcript: str,
        confidence: float = 1.0,
        emit: EventEmitter | None = None,
    ) -> dict[str, Any]:
        session = self._require_session(session_id)
        start = time.perf_counter()

        msg = InterviewMessage(
            role=MessageRole.CANDIDATE,
            content=transcript,
            transcript_confidence=confidence,
        ).model_dump()
        session["messages"].append(msg)

        try:
            self._repo.append_message(
                session_id,
                role=MessageRole.CANDIDATE.value,
                content=transcript,
                transcript_confidence=confidence,
            )
        except Exception as exc:
            logger.warning("Message persist failed: %s", exc)

        history = [
            {
                "role": "candidate" if m["role"] == MessageRole.CANDIDATE.value else "assistant",
                "content": m["content"],
            }
            for m in session["messages"]
        ]

        content = self._gemini.analyze_answer(
            candidate_answer=transcript,
            history=history,
            job_context=session["job_context"],
            required_skills=session["required_skills"],
        )
        session["content_results"].append(content.model_dump())

        partial = self._partial_score(session, content)
        latency_ms = int((time.perf_counter() - start) * 1000)
        self._persist_session(session_id, session)

        payload = {
            "type": "content_analysis",
            "session_id": session_id,
            "latency_ms": latency_ms,
            "content": content.model_dump(),
            "scores": partial,
        }

        try:
            self._repo.save_analytics(
                session_id,
                analyzer="gemini_pro",
                raw_output=content.model_dump(),
                latency_ms=latency_ms,
            )
            self._repo.record_event(
                session_id,
                event_type="analysis.content",
                payload={"scores": partial},
                latency_ms=latency_ms,
            )
        except Exception as exc:
            logger.warning("Analytics persist failed: %s", exc)

        if emit:
            await emit("analysis.content", payload)

        return payload

    async def process_audio_chunk(
        self,
        session_id: str,
        audio_bytes: bytes,
        *,
        emit: EventEmitter | None = None,
    ) -> dict[str, Any]:
        session = self._require_session(session_id)
        start = time.perf_counter()
        audio_result = self._audio.analyze(audio_bytes)
        session["latest_audio"] = audio_result.model_dump()

        partial = self._partial_score(session)
        latency_ms = int((time.perf_counter() - start) * 1000)
        self._persist_session(session_id, session)

        payload = {
            "type": "audio_analysis",
            "session_id": session_id,
            "latency_ms": latency_ms,
            "audio": audio_result.model_dump(),
            "scores": partial,
        }
        try:
            self._repo.save_analytics(
                session_id,
                analyzer="audio_librosa",
                raw_output=audio_result.model_dump(),
                latency_ms=latency_ms,
            )
        except Exception as exc:
            logger.warning("Audio analytics persist failed: %s", exc)

        if emit:
            await emit("analysis.audio", payload)
        return payload

    async def process_video_frame(
        self,
        session_id: str,
        frame_bytes: bytes,
        *,
        emit: EventEmitter | None = None,
    ) -> dict[str, Any]:
        session = self._require_session(session_id)
        start = time.perf_counter()
        facial_result = self._facial.analyze_frame(frame_bytes)
        session["latest_facial"] = facial_result.model_dump()

        partial = self._partial_score(session)
        latency_ms = int((time.perf_counter() - start) * 1000)
        self._persist_session(session_id, session)

        payload = {
            "type": "facial_analysis",
            "session_id": session_id,
            "latency_ms": latency_ms,
            "facial": facial_result.model_dump(),
            "scores": partial,
        }
        try:
            self._repo.save_analytics(
                session_id,
                analyzer="facial_mediapipe",
                raw_output=facial_result.model_dump(),
                latency_ms=latency_ms,
            )
        except Exception as exc:
            logger.warning("Facial analytics persist failed: %s", exc)

        if emit:
            await emit("analysis.facial", payload)
        return payload

    async def finalize_session(
        self,
        session_id: str,
        *,
        emit: EventEmitter | None = None,
    ) -> dict[str, Any]:
        session = self._require_session(session_id)
        session["status"] = InterviewStatus.PROCESSING.value
        self._persist_session(session_id, session)

        latest_content = session["content_results"][-1] if session["content_results"] else {}
        content = ContentAnalysisResult.model_validate(
            latest_content or ContentAnalysisResult().model_dump()
        )

        audio = AudioAnalysisResult.model_validate(
            session.get("latest_audio") or AudioAnalysisResult().model_dump()
        )
        facial = FacialAnalysisResult.model_validate(
            session.get("latest_facial") or FacialAnalysisResult().model_dump()
        )

        final = self._scoring.compute(
            content=content,
            audio=audio,
            facial=facial,
            required_skills=session["required_skills"],
        )

        session["status"] = InterviewStatus.COMPLETED.value
        session["ended_at"] = datetime.now(timezone.utc).isoformat()
        session["final_score"] = final.model_dump()
        self._persist_session(session_id, session)

        try:
            self._repo.update_status(
                session_id,
                InterviewStatus.COMPLETED.value,
                ended_at=session["ended_at"],
            )
            self._repo.save_score(session_id, final.model_dump())
            self._repo.save_training_row(
                session_id,
                feature_vector={
                    "dimensions": final.dimensions,
                    "message_count": len(session["messages"]),
                },
                label={
                    "recommendation": final.recommendation,
                    "overall_score": final.overall_score,
                },
            )
        except Exception as exc:
            logger.warning("Finalize persist failed: %s", exc)

        summary = {
            "type": "interview_complete",
            "session_id": session_id,
            "final_score": final.model_dump(),
            "message_count": len(session["messages"]),
        }
        if emit:
            await emit("interview.complete", summary)
        return summary

    def _partial_score(
        self,
        session: dict[str, Any],
        content: ContentAnalysisResult | None = None,
    ) -> dict[str, Any]:
        if content is None and session["content_results"]:
            content = ContentAnalysisResult.model_validate(session["content_results"][-1])
        elif content is None:
            content = ContentAnalysisResult()

        audio = AudioAnalysisResult.model_validate(
            session.get("latest_audio") or AudioAnalysisResult().model_dump()
        )
        facial = FacialAnalysisResult.model_validate(
            session.get("latest_facial") or FacialAnalysisResult().model_dump()
        )

        final = self._scoring.compute(
            content=content,
            audio=audio,
            facial=facial,
            required_skills=session["required_skills"],
        )
        return final.model_dump()

    def _require_session(self, session_id: str) -> dict[str, Any]:
        session = self._store.get(session_id)
        if not session:
            raise KeyError(f"Interview session not found: {session_id}")
        return session


_orchestrator: InterviewOrchestrator | None = None


def get_interview_orchestrator() -> InterviewOrchestrator:
    global _orchestrator
    if _orchestrator is None:
        _orchestrator = InterviewOrchestrator()
    return _orchestrator
