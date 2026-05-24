export type InterviewPhaseId =
  | "greeting"
  | "warmup"
  | "technical"
  | "problem_solving"
  | "behavioral"
  | "deep_followup"
  | "reflection"
  | "closing"

export interface ConversationEntry {
  role: "interviewer" | "candidate"
  content: string
  question?: string
  phase?: string
}

export type InterviewWsEvent =
  | { type: "connected"; session_id: string; role: string }
  | { type: "pong" }
  | { type: "content_analysis"; scores: InterviewScores; content: Record<string, unknown> }
  | { type: "audio_analysis"; scores: InterviewScores; audio: Record<string, unknown> }
  | { type: "facial_analysis"; scores: InterviewScores; facial: Record<string, unknown> }
  | { type: "coaching_hint"; hint: string }
  | { type: "interviewer_question"; question: string; phase?: string; phase_label?: string; progress_pct?: number }
  | {
      type: "interviewer_message"
      message: string
      question: string
      phase?: string
      phase_label?: string
      progress_pct?: number
      difficulty?: string
      follow_up_reason?: string
    }
  | {
      type: "phase_update"
      phase: InterviewPhaseId
      phase_label: string
      progress_pct: number
      difficulty?: string
    }
  | { type: "ai_thinking"; thinking: boolean }
  | { type: "interview_complete"; final_score: InterviewScores }
  | { type: "error"; message: string }

export interface InterviewScores {
  overall_score: number
  hire_probability: number
  skill_match_pct: number
  confidence_score: number
  authenticity_score: number
  content_score?: number
  audio_score?: number
  facial_score?: number
  recommendation: string
  dimensions?: Record<string, number>
  red_flags?: string[]
}

export interface CreateSessionResponse {
  session_id: string
  ws_url: string
  status: string
  opening_question?: string | null
  gemini_ready?: boolean
}
