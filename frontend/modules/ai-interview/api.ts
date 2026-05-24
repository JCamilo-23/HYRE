import type { CreateSessionResponse, InterviewScores } from "./types"

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://localhost:8000"

export async function createInterviewSession(body: {
  candidate_id: string
  job_context?: string
  required_skills?: string[]
}): Promise<CreateSessionResponse> {
  const res = await fetch(`${API_BASE}/api/v1/interviews/sessions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      candidate_id: body.candidate_id,
      job_context: body.job_context ?? "Rol tecnología — entrevista HYRE",
      required_skills: body.required_skills ?? [
        "comunicación",
        "javascript",
        "trabajo en equipo",
      ],
      mode: "live",
    }),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Failed to create session: ${res.status} ${text}`)
  }
  return res.json()
}

export async function getInterviewScores(sessionId: string): Promise<InterviewScores> {
  const res = await fetch(`${API_BASE}/api/v1/interviews/sessions/${sessionId}/scores`)
  if (!res.ok) throw new Error("Failed to fetch scores")
  const data = await res.json()
  return {
    overall_score: data.overall_score,
    hire_probability: data.hire_probability,
    skill_match_pct: data.skill_match_pct,
    confidence_score: data.confidence_score,
    authenticity_score: data.authenticity_score,
    recommendation: data.recommendation,
    dimensions: data.dimensions,
    red_flags: data.red_flags,
  }
}

export function getInterviewWsUrl(sessionId: string): string {
  const api = API_BASE.replace(/^http/, "ws")
  return `${api}/api/v1/interviews/ws/${sessionId}`
}
