"""Agent registry and auto-routing."""

from __future__ import annotations

from typing import Sequence

from app.domain.agents.base import BaseInterviewerAgent
from app.domain.agents.business import BusinessRecruiterAgent
from app.domain.agents.creative import CreativeRecruiterAgent
from app.domain.agents.tech import TechRecruiterAgent
from app.domain.agents.types import AgentType

_AGENTS: dict[str, type[BaseInterviewerAgent]] = {
    AgentType.TECH.value: TechRecruiterAgent,
    AgentType.CREATIVE.value: CreativeRecruiterAgent,
    AgentType.BUSINESS.value: BusinessRecruiterAgent,
}

_CREATIVE_KEYWORDS = (
    "ux", "ui", "design", "diseño", "figma", "brand", "creative", "motion",
    "marketing", "content", "visual", "product design",
)
_BUSINESS_KEYWORDS = (
    "sales", "ventas", "business", "customer success", "operations", "management",
    "leadership", "recruiting", "gtm", "account", "manager", "director",
)


def resolve_agent_type(
    *,
    requested: str | None,
    job_context: str = "",
    required_skills: Sequence[str] | None = None,
) -> str:
    if requested and requested != AgentType.AUTO.value and requested in _AGENTS:
        return requested
    blob = f"{job_context} {' '.join(required_skills or [])}".lower()
    if any(k in blob for k in _CREATIVE_KEYWORDS):
        return AgentType.CREATIVE.value
    if any(k in blob for k in _BUSINESS_KEYWORDS):
        return AgentType.BUSINESS.value
    return AgentType.TECH.value


def get_agent(agent_type: str) -> BaseInterviewerAgent:
    cls = _AGENTS.get(agent_type, TechRecruiterAgent)
    return cls()


def list_agents() -> list[dict[str, str]]:
    return [
        {"id": AgentType.TECH.value, "name": TechRecruiterAgent.display_name, "label": TechRecruiterAgent.specialty_label},
        {"id": AgentType.CREATIVE.value, "name": CreativeRecruiterAgent.display_name, "label": CreativeRecruiterAgent.specialty_label},
        {"id": AgentType.BUSINESS.value, "name": BusinessRecruiterAgent.display_name, "label": BusinessRecruiterAgent.specialty_label},
    ]
