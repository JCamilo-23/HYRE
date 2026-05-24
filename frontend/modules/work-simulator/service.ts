import type {
  ChallengeEvaluation,
  GenerateChallengeOptions,
  GenerateInterviewQuestionOptions,
  InterviewAnswerEvaluation,
  InterviewDifficulty,
  InterviewLiveScores,
  InterviewQuestion,
  InterviewQuestionCategory,
  ScenarioContext,
  WorkChallenge,
  WorkSimulatorMessage,
  WorkSimulatorSession,
} from "./types"
import type { WorkBlock } from "./constants"
import {
  INTERVIEW_CATEGORY_ROTATION,
  INTERVIEW_FALLBACK_BY_INDUSTRY,
  INTERVIEW_MAX_QUESTIONS_DEFAULT,
  TASK_EXAMPLES_BY_ROLE,
  TASK_EXAMPLES_BY_INDUSTRY,
} from "./constants"
import {
  CHALLENGE_GENERATION_SYSTEM,
  INTERVIEW_EVALUATION_SYSTEM,
  INTERVIEW_QUESTION_GENERATION_SYSTEM,
  OPENING_MESSAGE,
  STRICT_EVALUATION_SYSTEM,
  buildSimulatorSystem,
  challengeGenerationPrompt,
  interviewEvaluationPrompt,
  interviewQuestionGenerationPrompt,
} from "./prompts"
import {
  geminiChat,
  geminiGenerateJson,
  geminiGenerateProJson,
  geminiGenerateText,
} from "@/lib/gemini-server"
import { inferIndustryKey } from "@/lib/match-companies"
import { publishInterviewEvent } from "@/lib/interview-event-bus"

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
  const industryKey = inferIndustryKey(context.industry)
  const industryExamples =
    TASK_EXAMPLES_BY_INDUSTRY[industryKey] ?? TASK_EXAMPLES_BY_INDUSTRY.default
  const roleExamples = TASK_EXAMPLES_BY_ROLE[roleKey] ?? TASK_EXAMPLES_BY_ROLE.default
  const examples = industryKey !== "default" ? industryExamples : roleExamples
  const example = examples[(index - 1) % examples.length]
  const now = new Date().toISOString()
  const block = (slot?.work_block ?? "morning") as WorkBlock
  const simTime = slot?.sim_time_label ?? "09:00"
  const company = context.company_name ?? "la empresa"
  const industry = context.industry ?? "General"

  const industryTemplates: Record<string, Omit<WorkChallenge, "id" | "deadline_at">[]> = {
    tecnologia: [
      {
        title: `[${simTime}] Incidente en produccion`,
        type: "deliverable",
        deliverable_type: "bugfix_plan",
        urgency: "Urgente",
        assigned_by: "Carlos — Engineering Manager",
        work_block: block,
        sim_time_label: simTime,
        context: `En ${company} (${industry}), el checkout falla para el 12% de usuarios. El equipo senior esta en reunion. Como ${context.role_title}, debes proponer mitigacion inmediata.`,
        deliverable_description:
          "Documenta: diagnostico, hipotesis root cause, pasos de mitigacion, rollback, comunicacion al equipo y prevencion post-incidente.",
        acceptance_criteria: [
          "Pasos tecnicos ordenados y accionables",
          "Considera impacto en usuarios y SLA",
          "Incluye prevencion futura",
        ],
        time_limit_minutes: 30,
        xp: 520,
        evaluation_criteria: ["pensamiento tecnico", "priorizacion", "comunicacion"],
        min_quality_bar: "Plan ejecutable por un equipo de ingenieria en los proximos 30 minutos",
      },
      {
        title: `[${simTime}] Code review bloqueante`,
        type: "deliverable",
        deliverable_type: "code_review",
        urgency: "Alta",
        assigned_by: "Ana — Tech Lead",
        work_block: block,
        sim_time_label: simTime,
        context: `Un PR critico para ${example} lleva 2 dias pendiente. Ana necesita tu revision escrita antes del deploy de las ${simTime}.`,
        deliverable_description:
          "Redacta feedback de code review: problemas encontrados, sugerencias concretas, riesgos de seguridad/performance y decision merge o changes requested.",
        acceptance_criteria: [
          "Feedback especifico y accionable",
          "Menciona riesgos tecnicos reales",
          "Tono profesional de par senior",
        ],
        time_limit_minutes: 25,
        xp: 480,
        evaluation_criteria: ["calidad tecnica", "claridad", "criterio"],
        min_quality_bar: "Review que un dev senior podria usar para mejorar el PR sin reunion",
      },
    ],
    diseno: [
      {
        title: `[${simTime}] Hallazgos de usabilidad`,
        type: "deliverable",
        deliverable_type: "report",
        urgency: "Alta",
        assigned_by: "Sofia — Head of Design",
        work_block: block,
        sim_time_label: simTime,
        context: `En ${company}, las pruebas de usabilidad del flujo de onboarding revelaron friccion. Sofia pide informe antes del ${simTime}.`,
        deliverable_description:
          "Informe UX: resumen ejecutivo, 3-5 hallazgos con evidencia, impacto en conversion, recomendaciones priorizadas y proximos pasos de diseno.",
        acceptance_criteria: [
          "Hallazgos concretos con impacto medible",
          "Recomendaciones priorizadas",
          "Lenguaje claro para PM y stakeholders",
        ],
        time_limit_minutes: 30,
        xp: 500,
        evaluation_criteria: ["analisis UX", "comunicacion", "priorizacion"],
        min_quality_bar: "Informe presentable en revision de producto sin edicion mayor",
      },
      {
        title: `[${simTime}] Propuesta visual para cliente`,
        type: "deliverable",
        deliverable_type: "document",
        urgency: "Normal",
        assigned_by: "Mateo — Creative Director",
        work_block: block,
        sim_time_label: simTime,
        context: `Cliente startup pide propuesta para ${example}. Mateo necesita documento escrito con rationale de diseno para la reunion de las 15:00.`,
        deliverable_description:
          "Documento de propuesta: objetivo del diseno, referencias conceptuales descritas, flujo de usuario, decisiones de UI y plan de iteracion.",
        acceptance_criteria: [
          "Rationale claro de decisiones de diseno",
          "Flujo de usuario descrito paso a paso",
          "Alineado con cultura creativa de la empresa",
        ],
        time_limit_minutes: 35,
        xp: 460,
        evaluation_criteria: ["creatividad", "claridad", "alineacion con negocio"],
        min_quality_bar: "Propuesta que un director creativo enviaria al cliente",
      },
    ],
    fintech: [
      {
        title: `[${simTime}] Alerta de transacciones sospechosas`,
        type: "deliverable",
        deliverable_type: "report",
        urgency: "Urgente",
        assigned_by: "Laura — Risk & Compliance",
        work_block: block,
        sim_time_label: simTime,
        context: `En ${company}, el sistema detecto un patron anomalo en pagos P2P. Compliance exige informe de contencion antes del ${simTime}.`,
        deliverable_description:
          "Informe de riesgo: descripcion del patron, usuarios/transacciones afectadas, acciones inmediatas de contencion, comunicacion regulatoria si aplica y plan de monitoreo.",
        acceptance_criteria: [
          "Acciones de contencion concretas",
          "Considera cumplimiento y reputacion",
          "Plan de seguimiento con responsables",
        ],
        time_limit_minutes: 25,
        xp: 540,
        evaluation_criteria: ["analisis de riesgo", "compliance", "decision bajo presion"],
        min_quality_bar: "Informe que el equipo de riesgo usaria para actuar de inmediato",
      },
      {
        title: `[${simTime}] Comunicacion post-incidente de pagos`,
        type: "deliverable",
        deliverable_type: "client_response",
        urgency: "Urgente",
        assigned_by: "Diego — Customer Operations",
        work_block: block,
        sim_time_label: simTime,
        context: `Intermitencia en procesamiento de pagos afecto a comercios. ${company} debe responder a usuarios y partners antes del cierre de jornada.`,
        deliverable_description:
          "Redacta comunicacion oficial: reconocimiento del incidente, impacto, medidas tomadas, tiempos de resolucion estimados y canal de soporte prioritario.",
        acceptance_criteria: [
          "Tono profesional y transparente",
          "Informacion precisa sin especulacion",
          "Incluye proximos pasos para afectados",
        ],
        time_limit_minutes: 20,
        xp: 480,
        evaluation_criteria: ["comunicacion", "empatia", "precision"],
        min_quality_bar: "Comunicacion publicable en status page o email masivo",
      },
    ],
  }

  const defaultTemplates: Omit<WorkChallenge, "id" | "deadline_at">[] = [
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

  const templates =
    industryTemplates[industryKey] && industryKey !== "default"
      ? industryTemplates[industryKey]
      : defaultTemplates

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

function suggestedInterviewCategory(index: number): InterviewQuestionCategory {
  return INTERVIEW_CATEGORY_ROTATION[(index - 1) % INTERVIEW_CATEGORY_ROTATION.length]
}

export function getFallbackInterviewQuestion(
  index: number,
  context: ScenarioContext,
  difficulty: InterviewDifficulty = "medium",
): InterviewQuestion {
  const industryKey = inferIndustryKey(context.industry)
  const templates =
    INTERVIEW_FALLBACK_BY_INDUSTRY[industryKey] ?? INTERVIEW_FALLBACK_BY_INDUSTRY.default
  const item = templates[(index - 1) % templates.length]
  return {
    id: index,
    text: item.text.replace("TechCorp", context.company_name ?? "la empresa"),
    category: item.category,
    difficulty,
    focus_area: item.focus,
  }
}

function mergeInterviewScores(
  current: InterviewLiveScores | undefined,
  evaluation: InterviewAnswerEvaluation,
): InterviewLiveScores {
  const prev = current ?? {
    overall: 0,
    communication: 0,
    confidence: 0,
    relevance: 0,
    technical_depth: 0,
    questions_answered: 0,
  }
  const n = prev.questions_answered + 1
  const blend = (old: number, next: number) => Math.round((old * prev.questions_answered + next) / n)

  return {
    overall: blend(prev.overall, evaluation.score),
    communication: blend(prev.communication, evaluation.communication),
    confidence: blend(prev.confidence, evaluation.confidence),
    relevance: blend(prev.relevance, evaluation.relevance),
    technical_depth: blend(prev.technical_depth, evaluation.technical_depth),
    questions_answered: n,
  }
}

export function createInterviewSessionData(
  input: Parameters<typeof createSessionData>[0] & { max_questions?: number },
): WorkSimulatorSession {
  const session = createSessionData(input)
  session.scenario_context = {
    ...session.scenario_context,
    interview_mode: true,
    interview_question_index: 0,
    interview_question_titles: [],
    current_interview_question: null,
    interview_transcript_log: [],
    interview_scores: {
      overall: 0,
      communication: 0,
      confidence: 0,
      relevance: 0,
      technical_depth: 0,
      questions_answered: 0,
    },
    interview_max_questions: input.max_questions ?? INTERVIEW_MAX_QUESTIONS_DEFAULT,
    phase: "entrevista_en_vivo",
  }
  return session
}

export function createSessionData(input: {
  role_title?: string
  company_name?: string
  job_id?: string
  industry?: string
  job_description?: string
  culture?: string[]
  benefits?: string[]
}): WorkSimulatorSession {
  const role = input.role_title ?? "Profesional"
  const company = input.company_name ?? "Empresa"
  const id = crypto.randomUUID()
  const now = new Date().toISOString()

  const scenario_context: ScenarioContext = {
    role_title: role,
    company_name: company,
    industry: input.industry,
    job_description: input.job_description,
    culture: input.culture,
    benefits: input.benefits,
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

/** Genera pregunta de entrevista — mismo contexto Gemini que processChallenge */
export async function processInterviewQuestion(
  session: WorkSimulatorSession,
  options: GenerateInterviewQuestionOptions = {},
): Promise<{ question: InterviewQuestion; session: WorkSimulatorSession }> {
  const context = { ...session.scenario_context }
  const maxQ = context.interview_max_questions ?? INTERVIEW_MAX_QUESTIONS_DEFAULT
  const index = (context.interview_question_index ?? 0) + 1

  if (index > maxQ) {
    throw new Error("Entrevista completada — no hay más preguntas")
  }

  const difficulty = options.difficulty ?? "medium"
  const category = suggestedInterviewCategory(index)

  let question =
    (await geminiGenerateJson<InterviewQuestion & Record<string, unknown>>(
      INTERVIEW_QUESTION_GENERATION_SYSTEM,
      interviewQuestionGenerationPrompt(context, index, {
        difficulty,
        lastTranscript: options.last_transcript,
        suggestedCategory: category,
      }),
    )) ?? getFallbackInterviewQuestion(index, context, difficulty)

  const fallback = getFallbackInterviewQuestion(index, context, difficulty)
  question = {
    ...fallback,
    ...question,
    id: index,
    text: (question.text ?? fallback.text).trim(),
    category: (question.category ?? fallback.category) as InterviewQuestionCategory,
    difficulty: (question.difficulty ?? difficulty) as InterviewDifficulty,
    focus_area: question.focus_area ?? fallback.focus_area,
  }

  context.interview_question_index = index
  context.interview_question_titles = [...(context.interview_question_titles ?? []), question.text.slice(0, 80)]
  context.current_interview_question = question

  const updated: WorkSimulatorSession = {
    ...session,
    scenario_context: context,
    updated_at: new Date().toISOString(),
  }

  publishInterviewEvent(session.id, {
    type: "question",
    question,
    progress: { current: index, total: maxQ },
  })

  return { question, session: updated }
}

/** Evalúa respuesta hablada con Gemini Pro y actualiza scoring en vivo */
export async function processInterviewAnswer(
  session: WorkSimulatorSession,
  transcript: string,
): Promise<{
  evaluation: InterviewAnswerEvaluation
  scores: InterviewLiveScores
  session: WorkSimulatorSession
}> {
  const context = { ...session.scenario_context }
  const question = context.current_interview_question
  if (!question) {
    throw new Error("No hay pregunta activa en la entrevista")
  }

  const trimmed = transcript.trim()
  if (!trimmed) {
    throw new Error("La transcripción está vacía")
  }

  publishInterviewEvent(session.id, {
    type: "transcript",
    transcript: trimmed,
    question_id: question.id,
  })

  publishInterviewEvent(session.id, { type: "analysis_started", question_id: question.id })

  let evaluation =
    (await geminiGenerateProJson<InterviewAnswerEvaluation & Record<string, unknown>>(
      INTERVIEW_EVALUATION_SYSTEM,
      interviewEvaluationPrompt(context, question, trimmed),
    )) ?? {
      score: 62,
      communication: 65,
      confidence: 60,
      relevance: 64,
      technical_depth: 58,
      feedback:
        "Respuesta comprensible. Profundiza con ejemplos concretos y métricas en la siguiente pregunta.",
      strengths: ["Participación activa"],
      improvements: ["Más detalle y estructura STAR"],
      passed: true,
    }

  evaluation = {
    score: Number(evaluation.score) || 62,
    communication: Number(evaluation.communication) || 65,
    confidence: Number(evaluation.confidence) || 60,
    relevance: Number(evaluation.relevance) || 64,
    technical_depth: Number(evaluation.technical_depth) || 58,
    feedback: evaluation.feedback ?? "",
    strengths: evaluation.strengths ?? [],
    improvements: evaluation.improvements ?? [],
    passed: evaluation.passed ?? (Number(evaluation.score) || 0) >= 55,
  }

  const scores = mergeInterviewScores(context.interview_scores, evaluation)
  context.interview_scores = scores
  context.interview_transcript_log = [
    ...(context.interview_transcript_log ?? []),
    { question_id: question.id, transcript: trimmed, at: new Date().toISOString() },
  ]
  context.current_interview_question = null

  const messages: WorkSimulatorMessage[] = [
    ...session.messages,
    { role: "user", content: `[Entrevista Q${question.id}] ${trimmed}` },
    {
      role: "assistant",
      content: `**Análisis IA** · ${evaluation.score}/100\n${evaluation.feedback}`,
    },
  ]

  const updated: WorkSimulatorSession = {
    ...session,
    scenario_context: context,
    messages,
    updated_at: new Date().toISOString(),
  }

  publishInterviewEvent(session.id, {
    type: "analysis",
    evaluation,
    scores,
    question_id: question.id,
  })

  return { evaluation, scores, session: updated }
}
