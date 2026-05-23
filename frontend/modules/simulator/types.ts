export interface Simulation {
  id: string
  job_id: string
  candidate_id: string
  status: "pending" | "in_progress" | "completed" | "failed"
  score: number | null
  video_url: string | null
  analysis: SimulationAnalysis | null
  created_at: string
  completed_at: string | null
}

export interface SimulationAnalysis {
  overall_score: number
  communication: number
  technical: number
  confidence: number
  feedback: string[]
  strengths: string[]
  improvements: string[]
}

export interface CreateSimulationInput {
  job_id: string
}
