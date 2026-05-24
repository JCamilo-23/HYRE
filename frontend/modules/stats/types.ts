export interface TopJob {
  id: string
  title: string
  company_name: string
  industry: string | null
  match_score: number
  location: string | null
  remote: boolean
}

export interface CandidateStats {
  xp: number
  level: number
  xp_next_level: number
  xp_progress_pct: number
  nova_cv_score: number | null
  matches_new: number
  matches_mutual: number
  simulations_active: number
  simulations_completed: number
  profile_completeness: number
  top_jobs: TopJob[]
}

export interface RecentCandidate {
  id: string
  full_name: string | null
  match_score: number
  skills: string[]
  city: string | null
  job_title: string
  match_status: string
  matched_at: string
}

export interface BusinessStats {
  jobs_active: number
  jobs_total: number
  candidates_matched: number
  matches_mutual: number
  profile_completeness: number
  recent_candidates: RecentCandidate[]
}
