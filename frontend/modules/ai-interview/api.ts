import type { CreateSessionResponse, InterviewScores } from "./types"
import { getInterviewWsBaseUrl } from "@/lib/interview-backend"

/** Browser: same-origin Next proxy. Server: direct backend URL. */
function getApiBase(): string {
  if (typeof window !== "undefined") {
    return ""
  }
  return (
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
    process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/$/, "") ||
    "http://127.0.0.1:8000"
  )
}

function sessionsPath(): string {
  const base = getApiBase()
  return base ? `${base}/api/v1/interviews/sessions` : "/api/interviews/sessions"
}

export async function checkInterviewBackend(): Promise<{
  ok: boolean
  detail?: string
  gemini_configured?: boolean
}> {
  const res = await fetch("/api/interviews/health", { cache: "no-store" })
  const data = await res.json()
  if (!res.ok || !data.ok) {
    return {
      ok: false,
      detail:
        data.detail ||
        "Backend no disponible. Ejecuta: cd backend && uvicorn app.main:app --reload --port 8000",
    }
  }
  return {
    ok: true,
    gemini_configured: Boolean(data.interview_engine?.gemini_configured),
  }
}

export async function createInterviewSession(body: {
  candidate_id: string
  job_context?: string
  required_skills?: string[]
}): Promise<CreateSessionResponse> {
  const res = await fetch(sessionsPath(), {
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
    let detail = `HTTP ${res.status}`
    try {
      const err = await res.json()
      detail = err.detail || err.message || JSON.stringify(err)
    } catch {
      detail = await res.text()
    }
    throw new Error(
      typeof detail === "string"
        ? detail
        : "No se pudo crear la sesión de entrevista",
    )
  }
  return res.json()
}

export async function getInterviewScores(sessionId: string): Promise<InterviewScores> {
  const base = getApiBase()
  const url = base
    ? `${base}/api/v1/interviews/sessions/${sessionId}/scores`
    : `/api/interviews/sessions/${sessionId}/scores`
  const res = await fetch(url)
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
  const wsBase = getInterviewWsBaseUrl()
  return `${wsBase}/api/v1/interviews/ws/${sessionId}`
}
