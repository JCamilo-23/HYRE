"""AI Interview Engine — REST + WebSocket realtime API."""

from __future__ import annotations

import base64
import json
import logging
import time
from typing import Any

from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect
from starlette.websockets import WebSocketDisconnect as StarletteWSDisconnect

from app.api.v1.schemas.interview_engine import (
    CreateInterviewRequest,
    CreateInterviewResponse,
    InterviewScoreResponse,
)
from app.core.config import settings
from app.core.exceptions import RateLimitExceeded
from app.domain.services.interview_orchestrator import get_interview_orchestrator
from app.infrastructure.gemini.interview_analyzer import GeminiInterviewAnalyzer
from app.infrastructure.redis.client import get_redis
from app.infrastructure.websocket.manager import ws_manager

logger = logging.getLogger(__name__)
router = APIRouter()

RATE_LIMIT_MAX = 120  # events per minute per session


def _check_rate_limit(session_id: str) -> None:
    redis = get_redis()
    if not redis:
        return
    key = f"rl:interview:{session_id}"
    count = redis.incr_rate_limit(key, 60)
    if count > RATE_LIMIT_MAX:
        raise RateLimitExceeded()



@router.get("/health")
async def interview_engine_health() -> dict[str, Any]:
    return {
        "status": "ok",
        "gemini_configured": bool(settings.GEMINI_API_KEY),
        "gemini_model": settings.GEMINI_PRO_MODEL,
        "require_gemini": settings.REQUIRE_GEMINI,
    }


@router.post("/sessions", response_model=CreateInterviewResponse)
async def create_interview_session(body: CreateInterviewRequest) -> CreateInterviewResponse:
    if settings.REQUIRE_GEMINI and not settings.GEMINI_API_KEY:
        raise HTTPException(
            status_code=503,
            detail="GEMINI_API_KEY no configurada en el backend. Añádela en backend/.env",
        )

    orchestrator = get_interview_orchestrator()
    session_id = orchestrator.create_session(
        candidate_id=body.candidate_id,
        job_id=body.job_id,
        recruiter_id=body.recruiter_id,
        job_context=body.job_context,
        required_skills=body.required_skills,
    )
    ws_path = f"/api/v1/interviews/ws/{session_id}"

    opening_question: str | None = None
    gemini_ready = bool(settings.GEMINI_API_KEY)
    if gemini_ready:
        session = orchestrator.get_session(session_id) or {}
        gemini = GeminiInterviewAnalyzer()
        opening_question = gemini.generate_next_question(
            history=[],
            job_context=body.job_context or session.get("job_context", ""),
            difficulty="medium",
        )
        session["opening_question"] = opening_question
        orchestrator._persist_session(session_id, session)  # noqa: SLF001

    return CreateInterviewResponse(
        session_id=session_id,
        ws_url=ws_path,
        status="live",
        opening_question=opening_question,
        gemini_ready=gemini_ready,
    )


@router.get("/sessions/{session_id}/scores", response_model=InterviewScoreResponse)
async def get_session_scores(session_id: str) -> InterviewScoreResponse:
    orchestrator = get_interview_orchestrator()
    session = orchestrator.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    final = session.get("final_score")
    if not final:
        partial = orchestrator._partial_score(session)  # noqa: SLF001
        final = partial
    return InterviewScoreResponse(
        session_id=session_id,
        overall_score=final["overall_score"],
        hire_probability=final["hire_probability"],
        skill_match_pct=final["skill_match_pct"],
        confidence_score=final["confidence_score"],
        authenticity_score=final["authenticity_score"],
        recommendation=final["recommendation"],
        dimensions=final.get("dimensions", {}),
        red_flags=final.get("red_flags", []),
    )


@router.post("/sessions/{session_id}/finalize")
async def finalize_interview(session_id: str) -> dict[str, Any]:
    orchestrator = get_interview_orchestrator()
    if not orchestrator.get_session(session_id):
        raise HTTPException(status_code=404, detail="Session not found")

    redis = get_redis()
    if redis and settings.USE_CELERY:
        from app.tasks.interview_tasks import finalize_interview_task

        task = finalize_interview_task.delay(session_id)
        return {"status": "processing", "task_id": task.id}
    return await orchestrator.finalize_session(session_id, emit=ws_manager.emit_to_session)


@router.websocket("/ws/{session_id}")
async def interview_websocket(websocket: WebSocket, session_id: str) -> None:
    orchestrator = get_interview_orchestrator()
    if not orchestrator.get_session(session_id):
        await websocket.close(code=4004, reason="Session not found")
        return

    gemini = GeminiInterviewAnalyzer()
    conn_id = await ws_manager.connect(websocket, session_id, role="candidate")

    session = orchestrator.get_session(session_id) or {}
    if session.get("opening_question"):
        await ws_manager.send_json(
            websocket,
            {
                "type": "interviewer_question",
                "question": session["opening_question"],
            },
        )
    elif settings.GEMINI_API_KEY:
        gemini_boot = GeminiInterviewAnalyzer()
        q = gemini_boot.generate_next_question(
            history=[],
            job_context=session.get("job_context", ""),
            difficulty="medium",
        )
        await ws_manager.send_json(websocket, {"type": "interviewer_question", "question": q})

    async def emit(event: str, payload: dict[str, Any]) -> None:
        await ws_manager.broadcast(session_id, {"type": event, **payload}, exclude=conn_id)

    try:
        while True:
            raw = await websocket.receive_text()
            try:
                msg = json.loads(raw)
            except json.JSONDecodeError:
                await ws_manager.send_json(websocket, {"type": "error", "message": "Invalid JSON"})
                continue

            event_type = msg.get("type", "")
            try:
                _check_rate_limit(session_id)
            except RateLimitExceeded:
                await ws_manager.send_json(
                    websocket,
                    {"type": "error", "message": "Rate limit exceeded. Slow down."},
                )
                continue

            if event_type == "ping":
                await ws_manager.send_json(websocket, {"type": "pong", "ts": time.time()})
                continue

            if event_type == "transcript":
                text = msg.get("text", "").strip()
                if not text:
                    continue
                try:
                    result = await orchestrator.process_transcript(
                        session_id,
                        transcript=text,
                        confidence=float(msg.get("confidence", 1.0)),
                        emit=emit,
                    )
                except (RuntimeError, ValueError) as exc:
                    await ws_manager.send_json(
                        websocket,
                        {"type": "error", "message": str(exc)},
                    )
                    continue
                hint = gemini.stream_coaching_hint(
                    candidate_answer=text,
                    stress_level=float(result.get("scores", {}).get("confidence_score", 50)),
                )
                await ws_manager.send_json(
                    websocket,
                    {"type": "coaching_hint", "hint": hint, **result},
                )
                continue

            if event_type == "audio_chunk":
                b64 = msg.get("data", "")
                if b64:
                    audio_bytes = base64.b64decode(b64)
                    if settings.USE_CELERY and get_redis():
                        from app.tasks.interview_tasks import process_audio_task

                        process_audio_task.delay(session_id, b64)
                        await ws_manager.send_json(websocket, {"type": "audio_queued"})
                    else:
                        await orchestrator.process_audio_chunk(session_id, audio_bytes, emit=emit)
                continue

            if event_type == "video_frame":
                b64 = msg.get("data", "")
                if b64:
                    frame = base64.b64decode(b64)
                    await orchestrator.process_video_frame(session_id, frame, emit=emit)
                continue

            if event_type == "request_question":
                session = orchestrator.get_session(session_id) or {}
                history = [
                    {"role": m.get("role", "user"), "content": m.get("content", "")}
                    for m in session.get("messages", [])
                ]
                q = gemini.generate_next_question(
                    history=history,
                    job_context=session.get("job_context", ""),
                    difficulty=msg.get("difficulty", "medium"),
                    emotion_hint=msg.get("emotion", "neutral"),
                )
                await ws_manager.broadcast(
                    session_id,
                    {"type": "interviewer_question", "question": q},
                )
                continue

            if event_type == "end_interview":
                summary = await orchestrator.finalize_session(session_id, emit=emit)
                await ws_manager.send_json(websocket, summary)
                break

            await ws_manager.send_json(
                websocket,
                {"type": "error", "message": f"Unknown event: {event_type}"},
            )

    except (WebSocketDisconnect, StarletteWSDisconnect):
        logger.info("WS client left session=%s", session_id)
    finally:
        await ws_manager.disconnect(session_id, conn_id)
