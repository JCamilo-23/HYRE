import type { DeliverableType, WorkBlock } from "./constants"

export type { WorkBlock, DeliverableType }

export interface ScenarioContext {
  role_title?: string
  company_name?: string
  job_description?: string
  requirements?: string[]
  phase?: string
  challenges_completed?: number
  challenge_titles?: string[]
  current_challenge?: WorkChallenge
  job_id?: string
  simulation_started_at?: string
  notifications_enabled?: boolean
  compressed_mode?: boolean
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
}

export interface GenerateChallengeOptions {
  slot_label?: string
  work_block?: WorkBlock
  sim_time_label?: string
  source?: "manual" | "scheduled" | "start"
}
