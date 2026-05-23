"""Work simulator business logic — orchestrates persistence and Gemini."""

from __future__ import annotations

import logging
import uuid
from typing import Any

from app.application.prompts.work_simulator import (
    CHALLENGE_GENERATION_SYSTEM,
    build_simulator_system,
    challenge_generation_prompt,
)
from app.domain.services.ai_chat import AIChatService

logger = logging.getLogger(__name__)

OPENING_MESSAGE = (
    "Bienvenido a tu simulación de día laboral. Soy tu entorno de práctica: "
    "te plantearé situaciones reales de {role} en {company}. "
    "Cuando estés listo, escribe «empezar» o cuéntame cómo te gustaría enfocar la práctica."
)


class WorkSimulatorUseCase:
    def __init__(
        self,
        ai: AIChatService,
        supabase_client: Any,
        *,
        pro_model: str | None = None,
    ) -> None:
        self._ai = ai
        self._db = supabase_client
        self._pro_model = pro_model

    def _table(self):
        return self._db.table("work_simulator_sessions")

    def create_session(
        self,
        *,
        user_id: str,
        job_id: str | None,
        role_title: str,
        company_name: str,
        scenario_context: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        context = scenario_context or {}
        if job_id:
            job_row = (
                self._db.table("jobs")
                .select("title, description, requirements, company_id")
                .eq("id", job_id)
                .single()
                .execute()
            )
            if job_row.data:
                job = job_row.data
                role_title = role_title or job.get("title", role_title)
                if not company_name and job.get("company_id"):
                    profile = (
                        self._db.table("profiles")
                        .select("full_name")
                        .eq("id", job["company_id"])
                        .single()
                        .execute()
                    )
                    if profile.data and profile.data.get("full_name"):
                        company_name = profile.data["full_name"]
                context.update({
                    "job_id": job_id,
                    "role_title": role_title,
                    "company_name": company_name,
                    "job_description": job.get("description", ""),
                    "requirements": job.get("requirements") or [],
                })

        context.setdefault("role_title", role_title)
        context.setdefault("company_name", company_name)
        context.setdefault("phase", "intro")
        context.setdefault("challenges_completed", 0)
        context.setdefault("challenge_titles", [])

        session_id = str(uuid.uuid4())
        opening = OPENING_MESSAGE.format(role=role_title, company=company_name)
        messages = [{"role": "assistant", "content": opening}]

        row = {
            "id": session_id,
            "user_id": user_id,
            "job_id": job_id,
            "role_title": role_title,
            "company_name": company_name,
            "scenario_context": context,
            "messages": messages,
            "status": "active",
        }
        result = self._table().insert(row).execute()
        if not result.data:
            raise RuntimeError("Failed to create work simulator session")
        logger.info("Created work simulator session %s for user %s", session_id, user_id)
        return result.data[0]

    def list_sessions(self, user_id: str) -> list[dict[str, Any]]:
        result = (
            self._table()
            .select("id, role_title, company_name, status, created_at, updated_at, scenario_context")
            .eq("user_id", user_id)
            .order("created_at", desc=True)
            .execute()
        )
        return result.data or []

    def get_session(self, session_id: str, user_id: str) -> dict[str, Any] | None:
        result = (
            self._table()
            .select("*")
            .eq("id", session_id)
            .eq("user_id", user_id)
            .single()
            .execute()
        )
        return result.data

    def send_message(self, session_id: str, user_id: str, message: str) -> dict[str, Any]:
        session = self.get_session(session_id, user_id)
        if not session:
            raise LookupError("Session not found")
        if session["status"] != "active":
            raise ValueError("Session is not active")

        messages: list[dict[str, str]] = list(session.get("messages") or [])
        messages.append({"role": "user", "content": message})

        context = session.get("scenario_context") or {}
        system = build_simulator_system(context)

        try:
            reply = self._ai.chat(
                system_instruction=system,
                history=messages,
                user_message=message,
                model_name=self._pro_model,
            )
        except Exception:
            logger.exception("Gemini chat failed for session %s", session_id)
            raise

        messages.append({"role": "assistant", "content": reply})
        self._table().update({"messages": messages}).eq("id", session_id).execute()

        return {"session_id": session_id, "reply": reply, "messages": messages}

    def generate_challenge(self, session_id: str, user_id: str) -> dict[str, Any]:
        session = self.get_session(session_id, user_id)
        if not session:
            raise LookupError("Session not found")

        context = dict(session.get("scenario_context") or {})
        titles = context.get("challenge_titles", [])
        index = len(titles) + 1

        prompt = challenge_generation_prompt(context, index)
        try:
            challenge = self._ai.generate_json(
                system_instruction=CHALLENGE_GENERATION_SYSTEM,
                user_prompt=prompt,
                model_name=self._pro_model,
            )
        except ValueError:
            logger.warning("Using fallback challenge for session %s", session_id)
            challenge = {
                "id": index,
                "title": "Priorización bajo presión",
                "type": "decision",
                "urgency": "Urgente",
                "context": "Tu líder pide entregar dos entregables hoy con el mismo equipo reducido.",
                "options": [
                    {"id": "A", "text": "Negociar alcance con el líder"},
                    {"id": "B", "text": "Priorizar el impacto al cliente"},
                    {"id": "C", "text": "Pedir refuerzo a otro equipo"},
                ],
                "time_limit_minutes": 10,
                "xp": 350,
                "evaluation_criteria": ["priorización", "comunicación", "ownership"],
            }

        titles.append(challenge.get("title", f"Reto {index}"))
        context["challenge_titles"] = titles
        context["challenges_completed"] = index
        context["phase"] = "active"
        context["current_challenge"] = challenge

        messages = list(session.get("messages") or [])
        intro = (
            f"**Nuevo reto #{index}: {challenge.get('title')}**\n\n"
            f"{challenge.get('context', '')}\n\n"
            f"Urgencia: {challenge.get('urgency', 'Normal')} · "
            f"Tiempo sugerido: {challenge.get('time_limit_minutes', 10)} min · "
            f"+{challenge.get('xp', 300)} XP"
        )
        if challenge.get("options"):
            opts = "\n".join(f"- **{o['id']}**: {o['text']}" for o in challenge["options"])
            intro += f"\n\nOpciones:\n{opts}"

        messages.append({"role": "assistant", "content": intro})

        self._table().update({
            "scenario_context": context,
            "messages": messages,
        }).eq("id", session_id).execute()

        return {"challenge": challenge, "message": intro}

    def evaluate_response(
        self,
        session_id: str,
        user_id: str,
        user_response: str,
    ) -> dict[str, Any]:
        session = self.get_session(session_id, user_id)
        if not session:
            raise LookupError("Session not found")

        context = session.get("scenario_context") or {}
        challenge = context.get("current_challenge")
        if not challenge:
            raise ValueError("No active challenge to evaluate")

        eval_prompt = f"""Evalúa la respuesta del candidato al reto laboral.

Reto: {challenge.get('title')}
Contexto: {challenge.get('context')}
Criterios: {', '.join(challenge.get('evaluation_criteria', []))}
Respuesta del candidato:
{user_response}

Responde JSON:
{{
  "score": 0-100,
  "xp_earned": 0-{challenge.get('xp', 300)},
  "strengths": ["..."],
  "improvements": ["..."],
  "feedback": "párrafo constructivo en español",
  "passed": true/false
}}"""

        try:
            evaluation = self._ai.generate_json(
                system_instruction="Eres un evaluador de talento senior. Sé justo, específico y constructivo.",
                user_prompt=eval_prompt,
                model_name=self._pro_model,
            )
        except ValueError:
            evaluation = {
                "score": 70,
                "xp_earned": int(challenge.get("xp", 300) * 0.7),
                "strengths": ["Participación activa"],
                "improvements": ["Profundiza en el impacto de tu decisión"],
                "feedback": "Buen intento. Intenta vincular tu respuesta con resultados medibles para el negocio.",
                "passed": True,
            }

        messages = list(session.get("messages") or [])
        feedback_text = (
            f"**Evaluación — {challenge.get('title')}**\n\n"
            f"Puntuación: **{evaluation.get('score', 0)}/100** · "
            f"+{evaluation.get('xp_earned', 0)} XP\n\n"
            f"{evaluation.get('feedback', '')}\n\n"
            f"Fortalezas: {', '.join(evaluation.get('strengths', []))}\n"
            f"A mejorar: {', '.join(evaluation.get('improvements', []))}"
        )
        messages.append({"role": "user", "content": user_response})
        messages.append({"role": "assistant", "content": feedback_text})

        context.pop("current_challenge", None)
        self._table().update({
            "messages": messages,
            "scenario_context": context,
        }).eq("id", session_id).execute()

        return {"evaluation": evaluation, "message": feedback_text}
