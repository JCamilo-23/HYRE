export interface NovaMessage {
  id: string
  role: "user" | "assistant"
  content: string
}

// ── CV Intelligence types ─────────────────────────────────

export type NovaCVStatus = "pending" | "processing" | "ready" | "error"

export interface NovaCV {
  id: string
  user_id: string
  name: string
  file_url: string | null
  file_type: string | null
  raw_text: string | null
  parsed_sections: Record<string, unknown>
  status: NovaCVStatus
  is_primary: boolean
  industry: string | null
  target_role: string | null
  seniority: string | null
  language: string
  word_count: number | null
  error_message: string | null
  created_at: string
  updated_at: string
  latest_analysis?: NovaAnalysis | null
}

export interface NovaScores {
  general: number
  ats: number
  technical: number
  recruiter: number
  visual: number
  communication: number
}

export interface NovaStrength {
  category: string
  description: string
  evidence: string
}

export interface NovaWeakness {
  category: string
  description: string
  evidence: string
  impact: "critical" | "high" | "medium" | "low"
}

export interface NovaATSIssue {
  issue: string
  description: string
  fix: string
}

export interface NovaKeywordGap {
  keyword: string
  importance: "critical" | "important" | "nice_to_have"
  context: string
}

export interface NovaBulletAnalysis {
  original: string
  problem: string
  suggested: string
}

export interface NovaAction {
  priority: number
  action: string
  impact: string
  time_estimate: string
}

export interface NovaAnalysis {
  id: string
  cv_id: string
  user_id: string
  score_general: number
  score_ats: number
  score_technical: number
  score_recruiter: number
  score_visual: number
  score_communication: number
  strengths: NovaStrength[]
  weaknesses: NovaWeakness[]
  ats_issues: NovaATSIssue[]
  keyword_gaps: NovaKeywordGap[]
  bullets_analysis: NovaBulletAnalysis[]
  sections_detected: string[]
  sections_missing: string[]
  top_actions: NovaAction[]
  feedback_summary: string
  feedback_detailed: Record<string, string>
  model_used: string
  processing_time_ms: number
  created_at: string
}
