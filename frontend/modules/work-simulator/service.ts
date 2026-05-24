import type { ChallengeEvaluation, ScenarioContext, WorkChallenge, WorkSimulatorMessage, WorkSimulatorSession } from "./types"
import {
  CHALLENGE_GENERATION_SYSTEM,
  OPENING_MESSAGE,
  buildSimulatorSystem,
  challengeGenerationPrompt,
} from "./prompts"
import { geminiChat, geminiGenerateJson, geminiGenerateText } from "@/lib/gemini-server"

export function getFallbackChallenge(index: number, context: ScenarioContext): WorkChallenge {
  const fallbacks: WorkChallenge[] = [
    {
      id: index,
      title: "Priorización bajo presión",
      type: "decision",
      urgency: "Urgente",
      context: `Tu líder en ${context.company_name} pide entregar dos entregables hoy con el mismo equipo reducido.`,
      options: [
        { id: "A", text: "Negociar alcance con el líder" },
        { id: "B", text: "Priorizar el impacto al cliente" },
        { id: "C", text: "Pedir refuerzo a otro equipo" },
      ],
      time_limit_minutes: 10,
      xp: 350,
      evaluation_criteria: ["priorización", "comunicación", "ownership"],
    },
    {
      id: index,
      title: "Correo difícil al cliente",
      type: "written",
      urgency: "Normal",
      context: "Un cliente reporta retraso en la entrega. Tu manager te pide redactar un correo profesional con plan de acción.",
      time_limit_minutes: 20,
      xp: 400,
      evaluation_criteria: ["comunicación", "empatía", "claridad"],
    },
    {
      id: index,
      title: "Crisis en producción",
      type: "crisis",
      urgency: "Urgente",
      context: "Es viernes 4pm y hay errores en producción. El equipo senior no está disponible.",
      options: [
        { id: "A", text: "Revisar logs antes de actuar" },
        { id: "B", text: "Escalar a infraestructura" },
        { id: "C", text: "Comunicar a usuarios mientras investigas" },
      ],
      time_limit_minutes: 15,
      xp: 450,
      evaluation_criteria: ["calma", "priorización", "comunicación"],
    },
  ]
  return fallbacks[(index - 1) % fallbacks.length]
}

export function formatChallengeMessage(challenge: WorkChallenge, index: number): string {
  let intro =
    `**Nuevo reto #${index}: ${challenge.title}**\n\n` +
    `${challenge.context}\n\n` +
    `Urgencia: ${challenge.urgency} · Tiempo sugerido: ${challenge.time_limit_minutes} min · +${challenge.xp} XP`

  if (challenge.options?.length) {
    intro += "\n\nOpciones:\n" + challenge.options.map((o) => `- **${o.id}**: ${o.text}`).join("\n")
  }
  return intro
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
    phase: "intro",
    challenges_completed: 0,
    challenge_titles: [],
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
): Promise<{ reply: string; messages: WorkSimulatorMessage[] }> {
  const messages = [...session.messages, { role: "user" as const, content: message }]
  const system = buildSimulatorSystem(session.scenario_context)

  let reply =
    (await geminiChat(system, messages, message)) ??
    (await fallbackChatReply(message, session.scenario_context))

  messages.push({ role: "assistant", content: reply })
  return { reply, messages }
}

async function fallbackChatReply(message: string, context: ScenarioContext): Promise<string> {
  const lower = message.toLowerCase()
  if (lower.includes("empezar") || lower.includes("iniciar")) {
    return `Perfecto. Empezamos la simulación como ${context.role_title} en ${context.company_name}. Pulsa **Nuevo reto** para tu primer desafío laboral, o cuéntame qué situación quieres practicar.`
  }
  const text = await geminiGenerateText(
    buildSimulatorSystem(context),
    message,
  )
  return (
    text ??
    `Entendido. Como ${context.role_title}, piensa en el impacto para el equipo y el cliente. ¿Quieres un **Nuevo reto** o prefieres describir una situación?`
  )
}

export async function processChallenge(
  session: WorkSimulatorSession,
): Promise<{ challenge: WorkChallenge; message: string; session: WorkSimulatorSession }> {
  const context = { ...session.scenario_context }
  const index = (context.challenge_titles?.length ?? 0) + 1

  let challenge =
    (await geminiGenerateJson<WorkChallenge & Record<string, unknown>>(
      CHALLENGE_GENERATION_SYSTEM,
      challengeGenerationPrompt(context, index),
    )) ?? getFallbackChallenge(index, context)

  challenge = { ...getFallbackChallenge(index, context), ...challenge, id: index }

  context.challenge_titles = [...(context.challenge_titles ?? []), challenge.title]
  context.challenges_completed = index
  context.phase = "active"
  context.current_challenge = challenge

  const intro = formatChallengeMessage(challenge, index)
  const messages = [...session.messages, { role: "assistant" as const, content: intro }]

  return {
    challenge,
    message: intro,
    session: {
      ...session,
      scenario_context: context,
      messages,
      updated_at: new Date().toISOString(),
    },
  }
}

export async function processEvaluation(
  session: WorkSimulatorSession,
  userResponse: string,
): Promise<{ evaluation: ChallengeEvaluation; message: string; session: WorkSimulatorSession }> {
  const challenge = session.scenario_context.current_challenge
  if (!challenge) {
    throw new Error("No hay reto activo para evaluar")
  }

  const evalPrompt = `Evalúa la respuesta del candidato al reto laboral.

Reto: ${challenge.title}
Contexto: ${challenge.context}
Criterios: ${(challenge.evaluation_criteria ?? []).join(", ")}
Respuesta:
${userResponse}

JSON:
{
  "score": 0-100,
  "xp_earned": 0-${challenge.xp},
  "strengths": ["..."],
  "improvements": ["..."],
  "feedback": "párrafo constructivo en español",
  "passed": true
}`

  let evaluation =
    (await geminiGenerateJson<ChallengeEvaluation & Record<string, unknown>>(
      "Eres un evaluador de talento senior. Sé justo, específico y constructivo.",
      evalPrompt,
    )) ?? {
      score: 72,
      xp_earned: Math.round(challenge.xp * 0.72),
      strengths: ["Participación activa", "Enfoque en la solución"],
      improvements: ["Vincula tu respuesta con impacto medible"],
      feedback:
        "Buen intento. Intenta explicar el porqué de tu decisión y cómo comunicarías el plan al equipo.",
      passed: true,
    }

  const feedbackText =
    `**Evaluación — ${challenge.title}**\n\n` +
    `Puntuación: **${evaluation.score}/100** · +${evaluation.xp_earned} XP\n\n` +
    `${evaluation.feedback}\n\n` +
    `Fortalezas: ${evaluation.strengths.join(", ")}\n` +
    `A mejorar: ${evaluation.improvements.join(", ")}`

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
