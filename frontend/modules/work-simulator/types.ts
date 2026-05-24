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
  type: string
  urgency: string
  context: string
  options?: { id: string; text: string }[]
  time_limit_minutes: number
  xp: number
  evaluation_criteria?: string[]
}

export interface ChallengeEvaluation {
  score: number
  xp_earned: number
  strengths: string[]
  improvements: string[]
  feedback: string
  passed: boolean
}

export interface CreateWorkSimulatorSessionInput {
  job_id?: string
  role_title?: string
  company_name?: string
}
