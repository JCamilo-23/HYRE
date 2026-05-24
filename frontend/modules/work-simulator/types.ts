import type { DeliverableType, WorkBlock } from "./constants"

export type { WorkBlock, DeliverableType }

export interface ScenarioContext {
  role_title?: string
  company_name?: string
  industry?: string
  job_description?: string
  culture?: string[]
  benefits?: string[]
  requirements?: string[]
  phase?: string
  challenges_completed?: number
  challenge_titles?: string[]
  current_challenge?: WorkChallenge
  job_id?: string
  simulation_started_at?: string
  notifications_enabled?: boolean
  compressed_mode?: boolean
  /** Entrevista en vivo — reutiliza el mismo contexto del simulador */
  interview_mode?: boolean
  interview_question_index?: number
  interview_question_titles?: string[]
  current_interview_question?: InterviewQuestion | null
  interview_transcript_log?: InterviewTranscriptEntry[]
  interview_scores?: InterviewLiveScores
  interview_max_questions?: number
}

export type InterviewQuestionCategory =
  | "intro"
  | "behavioral"
  | "technical"
  | "situational"
  | "culture"
  | "simulation_followup"
  | "closing"

export type InterviewDifficulty = "easy" | "medium" | "hard"

export interface InterviewQuestion {
  id: number
  text: string
  category: InterviewQuestionCategory
  difficulty: InterviewDifficulty
  focus_area: string
  /** Contexto breve para el entrevistador (no se muestra al candidato) */
  interviewer_notes?: string
}

export interface InterviewTranscriptEntry {
  question_id: number
  transcript: string
  at: string
}

export interface InterviewAnswerEvaluation {
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

export interface InterviewLiveScores {
  overall: number
  communication: number
  confidence: number
  relevance: number
  technical_depth: number
  questions_answered: number
}

export interface WorkSimulatorSession {
  id: string
  user_id: string
  job_id: string | null
  role_title: string
  company_name: string
  scenario_context: ScenarioContext
  messages: WorkSimulatorMessage[]
  status: "active" | "completed" | "archived"
  created_at: string
  updated_at?: string
}

export interface WorkSimulatorMessage {
  role: "user" | "assistant"
  content: string
}

export interface WorkChallenge {
  id: number
  title: string
  type: "deliverable"
  deliverable_type: DeliverableType
  urgency: string
  assigned_by: string
  work_block: WorkBlock
  sim_time_label: string
  context: string
  deliverable_description: string
  acceptance_criteria: string[]
  time_limit_minutes: number
  deadline_at: string
  xp: number
  evaluation_criteria: string[]
  min_quality_bar: string
  /** @deprecated No usar — las tareas no son quiz */
  options?: never
}

export interface ChallengeEvaluation {
  score: number
  xp_earned: number
  strengths: string[]
  improvements: string[]
  feedback: string
  passed: boolean
  quality_level: "insuficiente" | "aceptable" | "bueno" | "excelente"
}

export interface CreateWorkSimulatorSessionInput {
  job_id?: string
  role_title?: string
  company_name?: string
  industry?: string
  job_description?: string
  culture?: string[]
  benefits?: string[]
}

export interface GenerateChallengeOptions {
  slot_label?: string
  work_block?: WorkBlock
  sim_time_label?: string
  source?: "manual" | "scheduled" | "start"
}

export interface GenerateInterviewQuestionOptions {
  difficulty?: InterviewDifficulty
  /** Última transcripción del candidato — adapta la siguiente pregunta */
  last_transcript?: string
}
