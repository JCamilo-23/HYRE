"""REST API for AI-powered work-day simulator."""

from __future__ import annotations

import logging

from fastapi import APIRouter, Depends, HTTPException, status

from app.api.v1.schemas import (
    WorkSimulatorEvaluateRequest,
    WorkSimulatorMessageRequest,
    WorkSimulatorMessageResponse,
    WorkSimulatorSessionCreate,
    WorkSimulatorSessionResponse,
)
from app.core.auth import get_current_user
from app.core.dependencies import get_work_simulator_use_case
from app.domain.use_cases.work_simulator import WorkSimulatorUseCase

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/sessions", response_model=list[WorkSimulatorSessionResponse])
async def list_sessions(
    current_user=Depends(get_current_user),
    use_case: WorkSimulatorUseCase = Depends(get_work_simulator_use_case),
):
    rows = use_case.list_sessions(str(current_user.id))
    return rows


@router.post(
    "/sessions",
    response_model=WorkSimulatorSessionResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_session(
    body: WorkSimulatorSessionCreate,
    current_user=Depends(get_current_user),
    use_case: WorkSimulatorUseCase = Depends(get_work_simulator_use_case),
):
    try:
        session = use_case.create_session(
            user_id=str(current_user.id),
            job_id=str(body.job_id) if body.job_id else None,
            role_title=body.role_title,
            company_name=body.company_name,
            scenario_context=body.scenario_context,
        )
        return session
    except Exception as exc:
        logger.exception("create_session failed")
        raise HTTPException(status_code=500, detail="Could not create simulator session") from exc


@router.get("/sessions/{session_id}", response_model=WorkSimulatorSessionResponse)
async def get_session(
    session_id: str,
    current_user=Depends(get_current_user),
    use_case: WorkSimulatorUseCase = Depends(get_work_simulator_use_case),
):
    session = use_case.get_session(session_id, str(current_user.id))
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session


@router.post("/sessions/{session_id}/messages", response_model=WorkSimulatorMessageResponse)
async def send_message(
    session_id: str,
    body: WorkSimulatorMessageRequest,
    current_user=Depends(get_current_user),
    use_case: WorkSimulatorUseCase = Depends(get_work_simulator_use_case),
):
    try:
        result = use_case.send_message(session_id, str(current_user.id), body.message)
        return WorkSimulatorMessageResponse(**result)
    except LookupError:
        raise HTTPException(status_code=404, detail="Session not found")
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception as exc:
        logger.exception("send_message failed")
        raise HTTPException(status_code=502, detail="AI service unavailable") from exc


@router.post("/sessions/{session_id}/challenges")
async def generate_challenge(
    session_id: str,
    current_user=Depends(get_current_user),
    use_case: WorkSimulatorUseCase = Depends(get_work_simulator_use_case),
):
    try:
        return use_case.generate_challenge(session_id, str(current_user.id))
    except LookupError:
        raise HTTPException(status_code=404, detail="Session not found")
    except Exception as exc:
        logger.exception("generate_challenge failed")
        raise HTTPException(status_code=502, detail="Could not generate challenge") from exc


@router.post("/sessions/{session_id}/evaluate")
async def evaluate_response(
    session_id: str,
    body: WorkSimulatorEvaluateRequest,
    current_user=Depends(get_current_user),
    use_case: WorkSimulatorUseCase = Depends(get_work_simulator_use_case),
):
    try:
        return use_case.evaluate_response(
            session_id, str(current_user.id), body.response
        )
    except LookupError:
        raise HTTPException(status_code=404, detail="Session not found")
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception as exc:
        logger.exception("evaluate_response failed")
        raise HTTPException(status_code=502, detail="Could not evaluate response") from exc
