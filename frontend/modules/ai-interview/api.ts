import type {
  CreateSessionResponse,
  InterviewReportResponse,
  InterviewScores,
} from "./types"
import { getInterviewWsBaseUrl } from "@/lib/interview-backend"

function sessionsPath(): string {
  return "/api/interviews/sessions"
}

export async function checkInterviewBackend(): Promise<{
  ok: boolean
  detail?: string
  gemini_configured?: boolean
  gemini_source?: string
}> {
  try {
    const res = await fetch("/api/interviews/health", { cache: "no-store" })
    const data = await res.json()
    if (!res.ok || !data.ok) {
      return {
        ok: false,
        detail:
          data.detail ||
          "Backend no disponible. Ejecuta: cd backend && uvicorn app.main:app --reload --port 8000",
        gemini_configured: Boolean(data.gemini_configured),
      }
    }
    return {
      ok: true,
      gemini_configured: Boolean(data.gemini_configured),
      gemini_source: data.gemini_source,
    }
  } catch {
    return {
      ok: false,
      detail:
        'Error de red al conectar. ¿Está el frontend en marcha y el backend en el puerto 8000?',
    }
  }
}

export interface CreateSessionOptions {
  candidate_id: string
  job_context?: string
  required_skills?: string[]
  agent_type?: "auto" | "tech" | "creative" | "business"
  company_profile?: {
    name?: string
    style?: "balanced" | "google" | "startup" | "creative" | "corporate"
    intensity?: "relaxed" | "medium" | "intense"
    values?: string[]
  }
}

export async function fetchInterviewAgents(): Promise<
  { id: string; name: string; label: string }[]
> {
  const res = await fetch("/api/interviews/agents", { cache: "no-store" })
  if (!res.ok) return []
  const data = await res.json()
  return data.agents ?? []
}

export async function createInterviewSession(body: CreateSessionOptions & {
  candidate_id: string
  job_context?: string
  required_skills?: string[]
}): Promise<CreateSessionResponse> {
  let res: Response
  try {
    res = await fetch(sessionsPath(), {
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
        agent_type: body.agent_type ?? "auto",
        company_profile: body.company_profile ?? { style: "startup", intensity: "medium" },
      }),
    })
  } catch {
    throw new Error(
      "Failed to fetch — no se pudo contactar el servidor. Inicia el backend (puerto 8000) y el frontend (puerto 3000).",
    )
  }

  if (!res.ok) {
    let detail = `HTTP ${res.status}`
    try {
      const err = await res.json()
      detail =
        typeof err.detail === "string"
          ? err.detail
          : err.message || JSON.stringify(err)
    } catch {
      detail = await res.text()
    }
    throw new Error(detail || "No se pudo crear la sesión de entrevista")
  }
  return res.json()
}

export async function getInterviewScores(sessionId: string): Promise<InterviewScores> {
  const res = await fetch(`/api/interviews/sessions/${sessionId}/scores`)
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

export async function getInterviewReport(
  sessionId: string,
): Promise<InterviewReportResponse> {
  const res = await fetch(`/api/interviews/sessions/${sessionId}/report`, {
    cache: "no-store",
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(
      typeof err.detail === "string" ? err.detail : "Informe no disponible aún",
    )
  }
  return res.json()
}

export function getInterviewWsUrl(sessionId: string): string {
  return `${getInterviewWsBaseUrl()}/api/v1/interviews/ws/${sessionId}`
}
