"""Scalable WebSocket connection manager with Redis pub/sub fan-out."""

from __future__ import annotations

import asyncio
import json
import logging
from typing import Any
from uuid import uuid4

from fastapi import WebSocket
from starlette.websockets import WebSocketDisconnect

logger = logging.getLogger(__name__)


class ConnectionManager:
    """Manages interview room connections per session_id."""

    def __init__(self) -> None:
        self._rooms: dict[str, dict[str, WebSocket]] = {}
        self._lock = asyncio.Lock()

    async def connect(
        self,
        websocket: WebSocket,
        session_id: str,
        *,
        role: str = "candidate",
    ) -> str:
        await websocket.accept()
        conn_id = str(uuid4())
        async with self._lock:
            if session_id not in self._rooms:
                self._rooms[session_id] = {}
            self._rooms[session_id][conn_id] = websocket
        await self.send_json(
            websocket,
            {"type": "connected", "session_id": session_id, "role": role, "connection_id": conn_id},
        )
        logger.info("WS connected session=%s role=%s", session_id, role)
        return conn_id

    async def disconnect(self, session_id: str, conn_id: str) -> None:
        async with self._lock:
            room = self._rooms.get(session_id, {})
            room.pop(conn_id, None)
            if not room:
                self._rooms.pop(session_id, None)
        logger.info("WS disconnected session=%s", session_id)

    async def broadcast(self, session_id: str, message: dict[str, Any], *, exclude: str | None = None) -> None:
        async with self._lock:
            room = dict(self._rooms.get(session_id, {}))

        dead: list[str] = []
        for cid, ws in room.items():
            if cid == exclude:
                continue
            try:
                await self.send_json(ws, message)
            except Exception:
                dead.append(cid)

        for cid in dead:
            await self.disconnect(session_id, cid)

    @staticmethod
    async def send_json(websocket: WebSocket, data: dict[str, Any]) -> None:
        await websocket.send_text(json.dumps(data, default=str))

    async def emit_to_session(self, session_id: str, event: str, payload: dict[str, Any]) -> None:
        await self.broadcast(session_id, {"type": event, **payload})


ws_manager = ConnectionManager()
