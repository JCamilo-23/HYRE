import type {
  CreateWorkSimulatorSessionInput,
  InterviewAnswerEvaluation,
  InterviewLiveScores,
  InterviewQuestion,
  WorkSimulatorSession,
} from "@/modules/work-simulator/types"
import type { GenerateInterviewQuestionOptions } from "@/modules/work-simulator/types"

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(path, {
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers },
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(typeof data.detail === "string" ? data.detail : "Error de entrevista")
  }
  return data as T
}

export async function createInterviewSession(
  input: CreateWorkSimulatorSessionInput & { max_questions?: number },
) {
  return request<WorkSimulatorSession>("/api/work-simulator/sessions/interview", {
    method: "POST",
    body: JSON.stringify(input),
  })
}

export async function fetchInterviewQuestion(
  sessionId: string,
  options: GenerateInterviewQuestionOptions = {},
) {
  return request<{
    question: InterviewQuestion
    progress: { current: number; total: number }
    session: WorkSimulatorSession
  }>(`/api/work-simulator/sessions/${sessionId}/interview/questions`, {
    method: "POST",
    body: JSON.stringify(options),
  })
}

export async function evaluateInterviewAnswer(sessionId: string, transcript: string) {
  return request<{
    evaluation: InterviewAnswerEvaluation
    scores: InterviewLiveScores
    session: WorkSimulatorSession
  }>(`/api/work-simulator/sessions/${sessionId}/interview/evaluate`, {
    method: "POST",
    body: JSON.stringify({ transcript }),
  })
}

export function interviewStreamUrl(sessionId: string): string {
  return `/api/work-simulator/sessions/${sessionId}/interview/stream`
}
