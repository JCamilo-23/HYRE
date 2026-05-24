export type CandidateStatus = "pending" | "accepted" | "rejected"

export interface SimulationResult {
  score: number
  passed: boolean
  quality: "insuficiente" | "aceptable" | "bueno" | "excelente"
  feedback: string
  strengths: string[]
  improvements: string[]
  completedAt: string
}

export interface EmployerCandidate {
  id: number
  name: string
  role: string
  match: number
  score: number
  skills: string[]
  initials: string
  color: string
  status: CandidateStatus
  evaluatedAt: string
  summary: string
  highlights: string[]
  categories: { label: string; score: number }[]
  simulation?: SimulationResult
}

export const EMPLOYER_CANDIDATES: EmployerCandidate[] = [
  {
    id: 1,
    name: "Maria Gonzalez",
    role: "Desarrolladora Frontend",
    match: 92,
    score: 88,
    skills: ["React", "TypeScript", "Comunicacion"],
    initials: "MG",
    color: "#7C3AED",
    status: "pending",
    evaluatedAt: "Hace 2 horas",
    summary:
      "Excelente comunicacion y criterio tecnico. Demostro experiencia solida en React y resolvio el caso de priorizacion con claridad.",
    highlights: ["Top 12% para el rol", "Comunicacion sobresaliente", "Experiencia en equipos agiles"],
    categories: [
      { label: "Comunicacion", score: 92 },
      { label: "Tecnico", score: 86 },
      { label: "Cultura", score: 90 },
    ],
    simulation: {
      score: 91,
      passed: true,
      quality: "excelente",
      feedback: "Entregable listo para enviar a cliente real. Estructura clara, ownership total y manejo excelente del deadline.",
      strengths: ["Comunicación bajo presión", "Criterio de priorización", "Redacción profesional"],
      improvements: ["Podría incluir métricas de impacto más específicas"],
      completedAt: "Hace 3 horas",
    },
  },
  {
    id: 2,
    name: "Carlos Ruiz",
    role: "Desarrollador Frontend Jr",
    match: 85,
    score: 79,
    skills: ["JavaScript", "CSS", "Trabajo en equipo"],
    initials: "CR",
    color: "#06B6D4",
    status: "pending",
    evaluatedAt: "Hace 5 horas",
    summary:
      "Buen potencial y actitud colaborativa. Necesita reforzar profundidad en TypeScript pero muestra curva de aprendizaje acelerada.",
    highlights: ["Actitud proactiva", "Buen fit cultural", "Areas de mejora en TS"],
    categories: [
      { label: "Comunicacion", score: 84 },
      { label: "Tecnico", score: 74 },
      { label: "Cultura", score: 88 },
    ],
  },
  {
    id: 3,
    name: "Ana Lopez",
    role: "Desarrolladora Frontend",
    match: 78,
    score: 72,
    skills: ["Vue", "HTML", "Diseno"],
    initials: "AL",
    color: "#10B981",
    status: "accepted",
    evaluatedAt: "Ayer",
    summary:
      "Perfil creativo con buenas bases de frontend. Menor alineacion con el stack React requerido pero fuerte en UI.",
    highlights: ["Creatividad destacada", "Stack parcialmente alineado"],
    categories: [
      { label: "Comunicacion", score: 80 },
      { label: "Tecnico", score: 68 },
      { label: "Cultura", score: 76 },
    ],
  },
]
