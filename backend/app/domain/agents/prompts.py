"""Shared conversational quality rules for all HYRE interviewer agents."""

MIN_QUESTION_CHARS = 100
MIN_MESSAGE_CHARS = 140

FORBIDDEN_PATTERNS = """
NEVER generate:
- Single-word or label-style questions ("React?", "Docker?")
- Incomplete sentences ending abruptly ("Como desarrollador Full Stack,")
- Generic prompts ("Háblame de X", "¿Qué sabes de Y?")
- Bullet lists or multiple questions in one turn
- Robotic templates without context bridge
"""

PREMIUM_STRUCTURE = """
Each turn MUST follow this structure in "message":
1. Brief human acknowledgment (1-2 sentences) referencing something specific they said OR the role context.
2. Context bridge: set the scenario, stakes, or what you want to understand (1-2 sentences).
3. One substantial open question (2-4 sentences) that invites a detailed story with tradeoffs, metrics, or decisions.

The "question" field must contain ONLY the full open question (complete sentences, minimum {min_q} characters).
""".format(min_q=MIN_QUESTION_CHARS)

JSON_TURN_SCHEMA = """
Return ONLY valid JSON (no markdown):
{{
  "message": "full conversational turn: acknowledgment + bridge + question",
  "question": "the complete open question alone, rich and contextual",
  "phase": "...",
  "phase_label": "...",
  "difficulty": "easy|medium|hard",
  "progress_pct": 0-100,
  "follow_up_reason": "short internal note",
  "should_advance_phase": false,
  "transition_note": ""
}}
"""
