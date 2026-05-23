import { api } from "@/lib/api-client"
import type {
  ChallengeEvaluation,
  CreateWorkSimulatorSessionInput,
  WorkChallenge,
  WorkSimulatorSession,
} from "./types"

export async function createWorkSimulatorSession(input: CreateWorkSimulatorSessionInput) {
  return api.post<WorkSimulatorSession>("/api/v1/work-simulator/sessions", {
    job_id: input.job_id ?? null,
    role_title: input.role_title ?? "Profesional",
    company_name: input.company_name ?? "Empresa",
  })
}

export async function listWorkSimulatorSessions() {
  return api.get<WorkSimulatorSession[]>("/api/v1/work-simulator/sessions")
}

export async function getWorkSimulatorSession(sessionId: string) {
  return api.get<WorkSimulatorSession>(`/api/v1/work-simulator/sessions/${sessionId}`)
}

export async function sendWorkSimulatorMessage(sessionId: string, message: string) {
  return api.post<{ session_id: string; reply: string; messages: WorkSimulatorSession["messages"] }>(
    `/api/v1/work-simulator/sessions/${sessionId}/messages`,
    { message },
  )
}

export async function generateWorkChallenge(sessionId: string) {
  return api.post<{ challenge: WorkChallenge; message: string }>(
    `/api/v1/work-simulator/sessions/${sessionId}/challenges`,
    {},
  )
}

export async function evaluateWorkChallengeResponse(sessionId: string, response: string) {
  return api.post<{ evaluation: ChallengeEvaluation; message: string }>(
    `/api/v1/work-simulator/sessions/${sessionId}/evaluate`,
    { response },
  )
}
