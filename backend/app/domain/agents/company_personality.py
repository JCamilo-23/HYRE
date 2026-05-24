"""Company personality layer — adapts agent tone and interview intensity."""

from __future__ import annotations

from typing import Any

from app.domain.agents.types import CompanyProfile, CompanyStyle


STYLE_MODIFIERS: dict[CompanyStyle, str] = {
    CompanyStyle.GOOGLE: """
Company style: GOOGLE-LIKE
- Analytical, structured, first-principles thinking.
- Emphasize system design, scalability, tradeoffs, measurable impact.
- Calm, precise tone. Ask for clarification of assumptions.
- Prefer depth over breadth; probe edge cases respectfully.
""",
    CompanyStyle.STARTUP: """
Company style: HIGH-GROWTH STARTUP
- Move fast, ownership mentality, bias for action.
- Value ambiguity tolerance, autonomy, learning velocity, resourcefulness.
- Direct but respectful. Ask how they shipped under constraints.
- Celebrate scrappy problem-solving and end-to-end ownership.
""",
    CompanyStyle.CREATIVE: """
Company style: PREMIUM CREATIVE STUDIO
- Storytelling, empathy, craft, user obsession.
- Explore process, research, iteration, visual/brand thinking.
- Warm, inspiring tone. Ask about decisions and user impact.
""",
    CompanyStyle.CORPORATE: """
Company style: ENTERPRISE / CORPORATE
- Professional, structured, stakeholder awareness, compliance mindset.
- Emphasize communication, process, cross-functional collaboration.
- Measured tone. Ask about governance, scale, and reliability.
""",
    CompanyStyle.BALANCED: """
Company style: BALANCED HYRE DEFAULT
- Professional warmth, high bar, startup intelligence.
- Balance technical/behavioral depth with human connection.
""",
}


class CompanyPersonalityLayer:
    @staticmethod
    def resolve(raw: dict[str, Any] | CompanyProfile | None) -> CompanyProfile:
        if raw is None:
            return CompanyProfile()
        if isinstance(raw, CompanyProfile):
            return raw
        style_raw = str(raw.get("style", "balanced")).lower()
        try:
            style = CompanyStyle(style_raw)
        except ValueError:
            style = CompanyStyle.BALANCED
        return CompanyProfile(
            name=str(raw.get("name", "HYRE")),
            style=style,
            values=list(raw.get("values") or ["ownership", "excellence"]),
            intensity=str(raw.get("intensity", "medium")),
            hiring_philosophy=str(
                raw.get("hiring_philosophy", "Hire for impact and authentic excellence.")
            ),
            communication_tone=str(raw.get("communication_tone", "professional_warm")),
            technical_bar=str(raw.get("technical_bar", "high")),
            environment=str(raw.get("environment", "startup")),
        )

    @staticmethod
    def augment_system_prompt(base_system: str, profile: CompanyProfile) -> str:
        style_block = STYLE_MODIFIERS.get(profile.style, STYLE_MODIFIERS[CompanyStyle.BALANCED])
        intensity_notes = {
            "relaxed": "Keep pressure moderate; allow thinking time.",
            "medium": "Professional pace with thoughtful follow-ups.",
            "intense": "Senior-bar depth; respectfully challenge vague answers.",
        }
        intensity_note = intensity_notes.get(profile.intensity, "Professional pace.")

        return f"""{base_system}

━━━━━━━━━━━━━━━━━━
COMPANY PERSONALITY LAYER
━━━━━━━━━━━━━━━━━━
Organization: {profile.name}
Values: {", ".join(profile.values)}
Hiring philosophy: {profile.hiring_philosophy}
Technical bar: {profile.technical_bar}
Work environment: {profile.environment}
Communication tone: {profile.communication_tone}
Interview intensity: {profile.intensity} — {intensity_note}

{style_block}
Adapt vocabulary, depth, and follow-up pressure to match this company culture.
"""
