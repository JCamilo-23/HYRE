export interface Job {
  id: string
  company_id: string
  title: string
  description: string
  requirements: string[]
  salary_min: number | null
  salary_max: number | null
  location: string | null
  remote: boolean
  status: "active" | "paused" | "closed"
  created_at: string
  updated_at: string
}

export interface CreateJobInput {
  title: string
  description: string
  requirements: string[]
  salary_min?: number
  salary_max?: number
  location?: string
  remote?: boolean
}
