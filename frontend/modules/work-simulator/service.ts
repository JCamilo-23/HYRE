import type {
  ChallengeEvaluation,
  GenerateChallengeOptions,
  ScenarioContext,
  WorkChallenge,
  WorkSimulatorMessage,
  WorkSimulatorSession,
} from "./types"
import type { WorkBlock } from "./constants"
import { TASK_EXAMPLES_BY_ROLE } from "./constants"
import {
  CHALLENGE_GENERATION_SYSTEM,
  OPENING_MESSAGE,
  STRICT_EVALUATION_SYSTEM,
  buildSimulatorSystem,
  challengeGenerationPrompt,
} from "./prompts"
import { geminiChat, geminiGenerateJson, geminiGenerateText } from "@/lib/gemini-server"

function addMinutes(iso: string, minutes: number): string {
  return new Date(new Date(iso).getTime() + minutes * 60_000).toISOString()
}

function inferRoleKey(role: string): string {
  const lower = role.toLowerCase()
  if (lower.includes("frontend") || lower.includes("developer") || lower.includes("desarrollador")) {
    return "frontend"
  }
  return "default"
}

export function getFallbackChallenge(
  index: number,
  context: ScenarioContext,
  slot?: GenerateChallengeOptions,
): WorkChallenge {
  const roleKey = inferRoleKey(context.role_title ?? "")
  const examples = TASK_EXAMPLES_BY_ROLE[roleKey] ?? TASK_EXAMPLES_BY_ROLE.default
  const example = examples[(index - 1) % examples.length]
  const now = new Date().toISOString()
  const block = (slot?.work_block ?? "morning") as WorkBlock
  const simTime = slot?.sim_time_label ?? "09:00"

  const templates: Omit<WorkChallenge, "id" | "deadline_at">[] = [
    {
      title: `[${simTime}] Correo urgente al cliente`,
      type: "deliverable",
      deliverable_type: "email",
      urgency: "Urgente",
      assigned_by: "María — Customer Success Lead",
      work_block: block,
      sim_time_label: simTime,
      context: `En ${context.company_name}, un cliente enterprise reporta un incidente antes del ${simTime}. Tu manager necesita respuesta profesional en los próximos minutos.`,
      deliverable_description: `Redacta el correo completo al cliente: reconocimiento del problema, impacto, plan de acción con tiempos, y próxima actualización. Tono profesional y ownership claro.`,
      acceptance_criteria: [
        "Reconoce el problema sin excusas vagas",
        "Incluye plan con pasos concretos y tiempos",
        "Tono profesional orientado al cliente",
      ],
      time_limit_minutes: 25,
      xp: 450,
      evaluation_criteria: ["comunicación", "ownership", "claridad", "empatía"],
      min_quality_bar: "Correo enviable tal cual a un cliente real, sin placeholders",
    },
    {
      title: `[${simTime}] Plan de mitigación de incidente`,
      type: "deliverable",
      deliverable_type: "bugfix_plan",
      urgency: "Alta",
      assigned_by: "Carlos — Engineering Manager",
      work_block: block,
      sim_time_label: simTime,
      context: `Producción degradada en ${context.company_name}. El equipo senior está en reunión. Eres ${context.role_title} y debes proponer plan inmediato.`,
      deliverable_description: "Documenta: diagnóstico inicial, hipótesis, pasos de mitigación, rollback si aplica, comunicación al equipo y prevención futura.",
      acceptance_criteria: [
        "Pasos ordenados y accionables",
        "Considera riesgo y comunicación",
        "Incluye prevención post-incidente",
      ],
      time_limit_minutes: 30,
      xp: 500,
      evaluation_criteria: ["pensamiento crítico", "priorización", "comunicación técnica"],
      min_quality_bar: "Plan ejecutable por un equipo real en los próximos 30 minutos",
    },
    {
      title: `[${simTime}] Informe de avance`,
      type: "deliverable",
      deliverable_type: "report",
      urgency: "Normal",
      assigned_by: "Laura — Product Manager",
      work_block: block,
      sim_time_label: simTime,
      context: `Stand-up cancelado. Laura pide informe escrito de avance antes del mediodía sobre: ${example}`,
      deliverable_description: "Informe breve: qué completaste, blockers, decisiones tomadas, próximos pasos con fechas, y riesgos.",
      acceptance_criteria: ["Métricas o hechos concretos", "Blockers explícitos", "Próximos pasos con fechas"],
      time_limit_minutes: 20,
      xp: 380,
      evaluation_criteria: ["claridad", "completitud", "ownership"],
      min_quality_bar: "Informe que un PM podría reenviar al cliente interno sin editar",
    },
  ]

  const base = templates[(index - 1) % templates.length]
  return {
    ...base,
    id: index,
    deadline_at: addMinutes(now, base.time_limit_minutes),
  }
}

export function formatChallengeMessage(challenge: WorkChallenge): string {
  const deadline = new Date(challenge.deadline_at)
  const deadlineStr = deadline.toLocaleTimeString("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
  })

  return (
    `📋 **Nueva asignación — ${challenge.sim_time_label}**\n` +
    `**${challenge.title}**\n\n` +
    `👤 Asignado por: ${challenge.assigned_by}\n` +
    `⏱️ Deadline: **${deadlineStr}** (${challenge.time_limit_minutes} min) · Urgencia: **${challenge.urgency}** · +${challenge.xp} XP\n\n` +
    `**Contexto:**\n${challenge.context}\n\n` +
    `**Tu entregable:**\n${challenge.deliverable_description}\n\n` +
    `**Criterios de aceptación:**\n` +
    challenge.acceptance_criteria.map((c) => `• ${c}`).join("\n") +
    `\n\n_Entrega tu trabajo completo en el chat antes del deadline. La evaluación es exigente._`
  )
}

export function createSessionData(input: {
  role_title?: string
  company_name?: string
  job_id?: string
}): WorkSimulatorSession {
  const role = input.role_title ?? "Profesional"
  const company = input.company_name ?? "Empresa"
  const id = crypto.randomUUID()
  const now = new Date().toISOString()

  const scenario_context: ScenarioContext = {
    role_title: role,
    company_name: company,
    job_id: input.job_id,
    phase: "jornada",
    challenges_completed: 0,
    challenge_titles: [],
    simulation_started_at: now,
    notifications_enabled: false,
    compressed_mode: false,
  }

  return {
    id,
    user_id: "demo-user",
    job_id: input.job_id ?? null,
    role_title: role,
    company_name: company,
    scenario_context,
    messages: [{ role: "assistant", content: OPENING_MESSAGE(role, company) }],
    status: "active",
    created_at: now,
    updated_at: now,
  }
}

export async function processMessage(
  session: WorkSimulatorSession,
  message: string,
): Promise<{ reply: string; messages: WorkSimulatorMessage[]; session: WorkSimulatorSession }> {
  const messages = [...session.messages, { role: "user" as const, content: message }]
  const system = buildSimulatorSystem(session.scenario_context)
  const lower = message.toLowerCase()

  if (
    lower.includes("empezar jornada") ||
    lower.includes("empezar") ||
    lower.includes("iniciar jornada")
  ) {
    const startResult = await processChallenge(session, { source: "start", sim_time_label: "09:00", work_block: "morning", slot_label: "Inicio de jornada" })
    return {
      reply: startResult.message,
      messages: startResult.session.messages,
      session: startResult.session,
    }
  }

  const reply =
    (await geminiChat(system, messages, message)) ??
    (await geminiGenerateText(system, message)) ??
    `Recibido. Enfócate en entregar trabajo de calidad profesional. Si tienes una tarea activa, complétala antes del deadline.`

  messages.push({ role: "assistant", content: reply })
  const updated = { ...session, messages, updated_at: new Date().toISOString() }
  return { reply, messages, session: updated }
}

export async function processChallenge(
  session: WorkSimulatorSession,
  options: GenerateChallengeOptions = {},
): Promise<{ challenge: WorkChallenge; message: string; session: WorkSimulatorSession }> {
  if (session.scenario_context.current_challenge) {
    throw new Error("Tienes una tarea activa. Complétala antes de recibir otra.")
  }

  const context = { ...session.scenario_context }
  const index = (context.challenge_titles?.length ?? 0) + 1
  const now = new Date().toISOString()

  const slotMeta = {
    label: options.slot_label,
    block: options.work_block,
    simTimeLabel: options.sim_time_label,
  }

  let challenge =
    (await geminiGenerateJson<WorkChallenge & Record<string, unknown>>(
      CHALLENGE_GENERATION_SYSTEM,
      challengeGenerationPrompt(context, index, slotMeta),
    )) ?? getFallbackChallenge(index, context, options)

  const fallback = getFallbackChallenge(index, context, options)
  challenge = {
    ...fallback,
    ...challenge,
    id: index,
    type: "deliverable",
    deadline_at:
      challenge.deadline_at ??
      addMinutes(now, challenge.time_limit_minutes ?? fallback.time_limit_minutes),
    acceptance_criteria: challenge.acceptance_criteria ?? fallback.acceptance_criteria,
    deliverable_description:
      challenge.deliverable_description ?? fallback.deliverable_description,
    assigned_by: challenge.assigned_by ?? fallback.assigned_by,
    min_quality_bar: challenge.min_quality_bar ?? fallback.min_quality_bar,
  }

  context.challenge_titles = [...(context.challenge_titles ?? []), challenge.title]
  context.challenges_completed = index
  context.phase = "jornada_activa"
  context.current_challenge = challenge

  const intro = formatChallengeMessage(challenge)
  const messages = [...session.messages, { role: "assistant" as const, content: intro }]

  return {
    challenge,
    message: intro,
    session: {
      ...session,
      scenario_context: context,
      messages,
      updated_at: now,
    },
  }
}

export async function processEvaluation(
  session: WorkSimulatorSession,
  userResponse: string,
): Promise<{ evaluation: ChallengeEvaluation; message: string; session: WorkSimulatorSession }> {
  const challenge = session.scenario_context.current_challenge
  if (!challenge) {
    throw new Error("No hay tarea activa para evaluar")
  }

  const evalPrompt = `Evalúa este ENTREGABLE LABORAL REAL con estándares exigentes.

Tarea: ${challenge.title}
Entregable esperado: ${challenge.deliverable_description}
Criterios de aceptación: ${challenge.acceptance_criteria.join("; ")}
Barra mínima: ${challenge.min_quality_bar}
Deadline era: ${challenge.time_limit_minutes} minutos

Entrega del candidato:
${userResponse}

JSON:
{
  "score": 0-100,
  "xp_earned": 0-${challenge.xp},
  "strengths": ["..."],
  "improvements": ["..."],
  "feedback": "feedback directo y exigente en español",
  "passed": true/false,
  "quality_level": "insuficiente|aceptable|bueno|excelente"
}

Reglas: passed=false si score<60. score>=85 solo si es excelente y enviable tal cual.`

  let evaluation =
    (await geminiGenerateJson<ChallengeEvaluation & Record<string, unknown>>(
      STRICT_EVALUATION_SYSTEM,
      evalPrompt,
    )) ?? {
      score: 65,
      xp_earned: Math.round(challenge.xp * 0.65),
      strengths: ["Intento de abordar la tarea"],
      improvements: [
        "Falta detalle accionable",
        "No cumple criterios de aceptación completos",
        "Profundiza como en un entorno real exigente",
      ],
      feedback:
        "Entregable por debajo del estándar profesional esperado. En un entorno real, tu manager pediría revisión antes de enviar al cliente.",
      passed: false,
      quality_level: "aceptable" as const,
    }

  if (!evaluation.quality_level) {
    evaluation.quality_level =
      evaluation.score >= 85 ? "excelente" : evaluation.score >= 70 ? "bueno" : evaluation.score >= 60 ? "aceptable" : "insuficiente"
  }

  const feedbackText =
    `**Evaluación — ${challenge.title}**\n\n` +
    `Calidad: **${evaluation.quality_level}** · Puntuación: **${evaluation.score}/100** · +${evaluation.xp_earned} XP\n\n` +
    `${evaluation.feedback}\n\n` +
    `✅ Fortalezas: ${evaluation.strengths.join(", ")}\n` +
    `📌 A mejorar: ${evaluation.improvements.join(", ")}`

  const context = { ...session.scenario_context }
  delete context.current_challenge

  const messages = [
    ...session.messages,
    { role: "user" as const, content: userResponse },
    { role: "assistant" as const, content: feedbackText },
  ]

  return {
    evaluation,
    message: feedbackText,
    session: {
      ...session,
      scenario_context: context,
      messages,
      updated_at: new Date().toISOString(),
    },
  }
}
