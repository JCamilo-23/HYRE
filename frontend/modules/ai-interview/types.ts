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

export interface CultureFitInsights {
  personality_signals?: string[]
  communication_insights?: string[]
  startup_fit_score?: number
  leadership_indicators?: string[]
  adaptability_score?: number
  authenticity_signals?: string[]
  red_flags?: string[]
  psychological_summary?: string
  cultural_alignment_score?: number
  personality_profile?: string
}

export interface LiveFeedback {
  headline: string
  strengths: string[]
  improvements: string[]
  highlight_skills: string[]
  communication_note?: string
  technical_note?: string
}

export interface InterviewReport {
  executive_summary: string
  recommendation_narrative: string
  strengths: string[]
  areas_for_improvement: string[]
  technical_assessment: string
  behavioral_assessment: string
  communication_assessment: string
  skill_alignment: string[]
  red_flags_review: string[]
  next_steps: string
  interview_highlights: string[]
  overall_verdict: string
}

export type InterviewWsEvent =
  | { type: "connected"; session_id: string; role: string }
  | { type: "pong" }
  | { type: "content_analysis"; scores: InterviewScores; content: Record<string, unknown> }
  | { type: "scores_update"; scores: InterviewScores }
  | { type: "culture_insights"; insights: CultureFitInsights; scores?: InterviewScores }
  | { type: "live_feedback"; feedback: LiveFeedback; scores?: InterviewScores }
  | { type: "audio_analysis"; scores: InterviewScores; audio: Record<string, unknown> }
  | { type: "facial_analysis"; scores: InterviewScores; facial: Record<string, unknown> }
  | { type: "coaching_hint"; hint: string; scores?: InterviewScores }
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
  | {
      type: "interview_complete"
      final_score: InterviewScores
      final_report?: InterviewReport
    }
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
  agent_type?: string
  agent_display_name?: string
  company_style?: string
  session_id: string
  ws_url: string
  status: string
  opening_question?: string | null
  gemini_ready?: boolean
}

export interface InterviewReportResponse {
  session_id: string
  report: InterviewReport
  final_score?: InterviewScores | null
  generated_at?: string | null
}
