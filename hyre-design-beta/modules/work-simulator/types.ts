import type { DeliverableType, WorkBlock } from "./constants"

export type { WorkBlock, DeliverableType }

export interface ScenarioContext {
  role_title?: string
  company_name?: string
  industry?: string
  job_description?: string
  culture?: string[]
  benefits?: string[]
  current_challenge?: WorkChallenge
  job_id?: string
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
  source?: "manual" | "scheduled" | "compressed"
  sim_time_label?: string
  work_block?: WorkBlock
}
