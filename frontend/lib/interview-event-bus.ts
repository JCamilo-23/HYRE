/** In-process pub/sub for realtime interview updates (SSE subscribers). */

export type InterviewEventPayload =
  | {
      type: "question"
      question: {
        id: number
        text: string
        category: string
        difficulty: string
        focus_area: string
      }
      progress: { current: number; total: number }
    }
  | { type: "transcript"; transcript: string; question_id: number }
  | { type: "analysis_started"; question_id: number }
  | {
      type: "analysis"
      evaluation: {
        score: number
        communication: number
        confidence: number
        relevance: number
        technical_depth: number
        feedback: string
        strengths: string[]
        improvements: string[]
        passed: boolean
      }
      scores: {
        overall: number
        communication: number
        confidence: number
        relevance: number
        technical_depth: number
        questions_answered: number
      }
      question_id: number
    }
  | { type: "connected" }
  | {
      type: "interview_complete"
      scores: {
        overall: number
        communication: number
        confidence: number
        relevance: number
        technical_depth: number
        questions_answered: number
      }
    }

type Listener = (event: InterviewEventPayload) => void

const globalBus = globalThis as unknown as {
  interviewEventListeners?: Map<string, Set<Listener>>
}

function getListeners(): Map<string, Set<Listener>> {
  if (!globalBus.interviewEventListeners) {
    globalBus.interviewEventListeners = new Map()
  }
  return globalBus.interviewEventListeners
}

export function subscribeInterviewEvents(sessionId: string, listener: Listener): () => void {
  const map = getListeners()
  if (!map.has(sessionId)) {
    map.set(sessionId, new Set())
  }
  map.get(sessionId)!.add(listener)
  return () => {
    map.get(sessionId)?.delete(listener)
  }
}

export function publishInterviewEvent(sessionId: string, event: InterviewEventPayload): void {
  const set = getListeners().get(sessionId)
  if (!set) return
  for (const listener of set) {
    try {
      listener(event)
    } catch (err) {
      console.error("interview event listener error:", err)
    }
  }
}
