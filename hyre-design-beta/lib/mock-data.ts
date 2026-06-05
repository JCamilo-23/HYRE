import type { CandidateStats, BusinessStats } from "@/modules/stats/types"
import type { NovaAnalysis } from "@/modules/nova/types"
import type { CvAnalysis } from "@/lib/hyre-types"

export const MOCK_CANDIDATE_STATS: CandidateStats = {
  xp: 1240,
  level: 3,
  xp_next_level: 2000,
  xp_progress_pct: 62,
  nova_cv_score: 78,
  matches_new: 4,
  matches_mutual: 2,
  simulations_active: 1,
  simulations_completed: 3,
  profile_completeness: 85,
  top_jobs: [
    {
      id: "1",
      title: "Desarrollador Frontend Jr",
      company_name: "TechCorp",
      industry: "Tecnologia",
      match_score: 92,
      location: "Barranquilla",
      remote: true,
    },
    {
      id: "2",
      title: "Product Designer",
      company_name: "PixelLab",
      industry: "Diseno",
      match_score: 87,
      location: "Bogota",
      remote: false,
    },
  ],
}

export const MOCK_BUSINESS_STATS: BusinessStats = {
  jobs_active: 2,
  jobs_total: 5,
  candidates_matched: 18,
  matches_mutual: 6,
  profile_completeness: 90,
  recent_candidates: [
    {
      id: "c1",
      full_name: "Maria Lopez",
      match_score: 94,
      skills: ["React", "TypeScript", "Figma"],
      city: "Barranquilla",
      job_title: "Desarrollador Frontend Jr",
      match_status: "pending",
      matched_at: new Date().toISOString(),
    },
    {
      id: "c2",
      full_name: "Carlos Ruiz",
      match_score: 88,
      skills: ["Node.js", "PostgreSQL"],
      city: "Medellin",
      job_title: "Backend Developer",
      match_status: "pending",
      matched_at: new Date().toISOString(),
    },
  ],
}

export const MOCK_CV_ANALYSIS: CvAnalysis = {
  summary:
    "Perfil junior con buena base en React y experiencia en proyectos academicos. Destaca comunicacion y trabajo en equipo.",
  keyPoints: [
    "2 anos de experiencia en desarrollo web",
    "Portfolio con 4 proyectos publicados",
    "Certificacion en UX basico",
  ],
  skills: ["React", "TypeScript", "Tailwind CSS", "Git", "Figma"],
  experience: [
    {
      role: "Desarrollador Frontend",
      company: "Startup Local",
      duration: "2024 — Presente",
    },
  ],
  education: ["Ingenieria de Sistemas — Universidad del Norte"],
  strengths: ["Aprendizaje rapido", "Proactividad", "Comunicacion clara"],
  suggestions: [
    "Agregar metricas de impacto en proyectos",
    "Incluir experiencia con testing",
    "Destacar liderazgo en equipos estudiantiles",
  ],
}

export const MOCK_NOVA_ANALYSIS: NovaAnalysis = {
  id: "mock-analysis",
  cv_id: "mock-cv",
  user_id: "demo",
  score_general: 78,
  score_ats: 72,
  score_technical: 80,
  score_recruiter: 76,
  score_visual: 74,
  score_communication: 82,
  strengths: [
    {
      category: "Tecnico",
      description: "Stack moderno alineado con vacantes junior",
      evidence: "React, TypeScript, Tailwind en proyectos reales",
    },
  ],
  weaknesses: [
    {
      category: "ATS",
      description: "Faltan keywords de testing y CI/CD",
      evidence: "No aparecen Jest, Cypress ni GitHub Actions",
      impact: "medium",
    },
  ],
  ats_issues: [],
  keyword_gaps: [],
  bullets_analysis: [],
  sections_detected: ["experiencia", "educacion", "habilidades"],
  sections_missing: ["certificaciones"],
  top_actions: [
    {
      priority: 1,
      action: "Agregar seccion de logros con metricas",
      impact: "Mejora score ATS +8 puntos",
      time_estimate: "30 min",
    },
  ],
  feedback_summary: "Buen CV para roles junior. Con ajustes menores puede subir a 85+.",
  feedback_detailed: {},
  model_used: "design-beta-mock",
  processing_time_ms: 1200,
  created_at: new Date().toISOString(),
}
