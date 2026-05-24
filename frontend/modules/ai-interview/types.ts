export type InterviewWsEvent =
  | { type: "connected"; session_id: string; role: string }
  | { type: "pong" }
  | { type: "content_analysis"; scores: InterviewScores; content: Record<string, unknown> }
  | { type: "audio_analysis"; scores: InterviewScores; audio: Record<string, unknown> }
  | { type: "facial_analysis"; scores: InterviewScores; facial: Record<string, unknown> }
  | { type: "coaching_hint"; hint: string }
  | { type: "interviewer_question"; question: string }
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
