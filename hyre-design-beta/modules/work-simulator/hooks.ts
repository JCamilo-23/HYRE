"use client"

import { useCallback, useState } from "react"
import type {
  CreateWorkSimulatorSessionInput,
  GenerateChallengeOptions,
  WorkChallenge,
  WorkSimulatorMessage,
  WorkSimulatorSession,
} from "./types"

const WELCOME =
  "Bienvenido a tu simulacion de dia laboral. Soy tu entorno de practica: hoy tienes entregables reales que enviar al equipo."

const MOCK_CHALLENGE: WorkChallenge = {
  id: 1,
  title: "Correo al cliente sobre retraso del sprint",
  type: "deliverable",
  deliverable_type: "email",
  urgency: "alta",
  assigned_by: "Lider de proyecto",
  work_block: "morning",
  sim_time_label: "09:30",
  context: "El cliente TechRetail espera una actualizacion antes del mediodia.",
  deliverable_description:
    "Redacta un correo profesional explicando el retraso de 2 dias y el plan de recuperacion.",
  acceptance_criteria: [
    "Tono profesional y empatico",
    "Incluye causa raiz y plan con fechas",
    "Sin placeholders ni texto generico",
  ],
  time_limit_minutes: 25,
  deadline_at: new Date(Date.now() + 25 * 60 * 1000).toISOString(),
  xp: 120,
  evaluation_criteria: ["claridad", "tono", "plan de accion"],
  min_quality_bar: "Correo enviable tal cual a un cliente real",
}

function makeSession(input: CreateWorkSimulatorSessionInput): WorkSimulatorSession {
  return {
    id: `demo-${Date.now()}`,
    user_id: "demo",
    job_id: input.job_id ?? null,
    role_title: input.role_title ?? "Rol demo",
    company_name: input.company_name ?? "Empresa demo",
    scenario_context: {
      role_title: input.role_title,
      company_name: input.company_name,
      industry: input.industry,
      job_description: input.job_description,
      culture: input.culture,
      benefits: input.benefits,
      job_id: input.job_id,
    },
    messages: [{ role: "assistant", content: WELCOME }],
    status: "active",
    created_at: new Date().toISOString(),
  }
}

export function useWorkSimulator() {
  const [session, setSession] = useState<WorkSimulatorSession | null>(null)
  const [messages, setMessages] = useState<WorkSimulatorMessage[]>([])
  const [currentChallenge, setCurrentChallenge] = useState<WorkChallenge | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [compressedMode, setCompressedMode] = useState(false)
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number | null>(null)

  const startSession = useCallback(async (input: CreateWorkSimulatorSessionInput) => {
    setLoading(true)
    await new Promise((r) => setTimeout(r, 500))
    const created = makeSession(input)
    setSession(created)
    setMessages(created.messages)
    setLoading(false)
    return created
  }, [])

  const sendMessage = useCallback(async (text: string) => {
    if (!session) return
    setMessages((prev) => [...prev, { role: "user", content: text }])
    setLoading(true)
    await new Promise((r) => setTimeout(r, 700))
    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content:
          "Buen avance. En la beta de diseno, las respuestas son simuladas. Prueba solicitar una tarea con el boton de desafio.",
      },
    ])
    setLoading(false)
  }, [session])

  const requestChallenge = useCallback(async (_options: GenerateChallengeOptions = {}) => {
    if (!session) return
    setLoading(true)
    await new Promise((r) => setTimeout(r, 600))
    setCurrentChallenge(MOCK_CHALLENGE)
    setTimeLeftSeconds(MOCK_CHALLENGE.time_limit_minutes * 60)
    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: `Nueva tarea: ${MOCK_CHALLENGE.title}. Tienes ${MOCK_CHALLENGE.time_limit_minutes} minutos.`,
      },
    ])
    setLoading(false)
    return MOCK_CHALLENGE
  }, [session])

  const submitChallengeResponse = useCallback(async (text: string) => {
    setLoading(true)
    await new Promise((r) => setTimeout(r, 900))
    setMessages((prev) => [
      ...prev,
      { role: "user", content: text },
      {
        role: "assistant",
        content:
          "Entrega recibida. Puntuacion demo: 82/100. Fortalezas: tono claro y plan concreto. Mejora: agregar metrica de impacto.",
      },
    ])
    setCurrentChallenge(null)
    setTimeLeftSeconds(null)
    setLoading(false)
  }, [])

  return {
    session,
    messages,
    currentChallenge,
    loading,
    error,
    compressedMode,
    setCompressedMode,
    timeLeftSeconds,
    nextSlotLabel: "10:30",
    startSession,
    sendMessage,
    requestChallenge,
    submitChallengeResponse,
  }
}
