import type {
  ChallengeEvaluation,
  CreateWorkSimulatorSessionInput,
  WorkChallenge,
  WorkSimulatorSession,
} from "./types"

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(path, {
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers },
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(
      typeof data.detail === "string" ? data.detail : "Error de conexión con el simulador",
    )
  }
  return data as T
}

export async function createWorkSimulatorSession(input: CreateWorkSimulatorSessionInput) {
  return request<WorkSimulatorSession>("/api/work-simulator/sessions", {
    method: "POST",
    body: JSON.stringify({
      job_id: input.job_id ?? null,
      role_title: input.role_title ?? "Profesional",
      company_name: input.company_name ?? "Empresa",
    }),
  })
}

export async function sendWorkSimulatorMessage(sessionId: string, message: string) {
  return request<{ session_id: string; reply: string; messages: WorkSimulatorSession["messages"] }>(
    `/api/work-simulator/sessions/${sessionId}/messages`,
    { method: "POST", body: JSON.stringify({ message }) },
  )
}

export async function generateWorkChallenge(sessionId: string) {
  return request<{
    challenge: WorkChallenge
    message: string
    session: WorkSimulatorSession
  }>(`/api/work-simulator/sessions/${sessionId}/challenges`, {
    method: "POST",
    body: JSON.stringify({}),
  })
}

export async function evaluateWorkChallengeResponse(sessionId: string, response: string) {
  return request<{
    evaluation: ChallengeEvaluation
    message: string
    session: WorkSimulatorSession
  }>(`/api/work-simulator/sessions/${sessionId}/evaluate`, {
    method: "POST",
    body: JSON.stringify({ response }),
  })
}
