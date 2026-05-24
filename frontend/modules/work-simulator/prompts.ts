import type { InterviewQuestion, ScenarioContext } from "./types"
import type { WorkBlock } from "./constants"
import { INDUSTRY_TASK_FOCUS } from "./constants"
import { inferIndustryKey } from "@/lib/match-companies"

export const WORK_SIMULATOR_SYSTEM = `Eres el motor de simulación laboral EXIGENTE de JobFlow (Hyre).

NO eres un quiz ni un examen de opción múltiple. Simulas un día de trabajo REAL en una empresa.

Reglas estrictas:
- Asignas TRABAJOS REALES que la empresa exigiría: correos, documentos, fixes, informes, respuestas a clientes, planes de acción.
- NUNCA uses preguntas tipo test, opciones A/B/C, ni "elige la respuesta correcta".
- El candidato debe ENTREGAR un trabajo concreto (texto, plan, código descrito, documento).
- Sé exigente como un líder senior: expectativas altas, plazos claros, calidad profesional.
- Incluye contexto de presión real: stakeholders, deadlines, dependencias de equipo.
- Responde en español (Latinoamérica). Tono directo de entorno corporativo.
- Actúa como manager, PM, cliente o compañero según la tarea — mantén el personaje.`

export const CHALLENGE_GENERATION_SYSTEM = `Eres un diseñador de simulaciones laborales de alta fidelidad para reclutamiento.
Generas ASIGNACIONES DE TRABAJO REALES, no quizzes.
Cada tarea debe poder evaluarse por la calidad del entregable profesional.
Sé exigente: plazos ajustados, criterios claros, estándares altos.`

export const STRICT_EVALUATION_SYSTEM = `Eres un evaluador senior exigente en HYRE.
Calificas entregables laborales reales, no respuestas de quiz.
Criterios: calidad profesional, completitud, claridad, ownership, impacto al negocio.
Sé justo pero EXIGENTE — score 85+ solo para entregables excelentes.
Score bajo 60 si el entregable es vago, incompleto o no profesional.`

export function buildSimulatorSystem(context: ScenarioContext): string {
  const reqText = context.requirements?.length
    ? context.requirements.join(", ")
    : "no especificados"
  const cultureText = context.culture?.length ? context.culture.join(", ") : "no especificada"
  const industryFocus =
    context.industry && INDUSTRY_TASK_FOCUS[inferIndustryKey(context.industry)]
      ? INDUSTRY_TASK_FOCUS[inferIndustryKey(context.industry)]
      : INDUSTRY_TASK_FOCUS.default

  return `${WORK_SIMULATOR_SYSTEM}

Contexto activo:
- Rol: ${context.role_title ?? "Profesional"}
- Empresa: ${context.company_name ?? "la empresa"}
- Industria: ${context.industry ?? "General"}
- Descripcion del puesto: ${context.job_description ?? "General"}
- Cultura empresarial: ${cultureText}
- Requisitos: ${reqText}
- Fase: ${context.phase ?? "jornada laboral activa"}
- Tareas completadas hoy: ${context.challenges_completed ?? 0}
- Enfoque de tareas: ${industryFocus}
- Intensidad: EXIGENTE — estandares de produccion`
}

export function challengeGenerationPrompt(
  context: ScenarioContext,
  challengeIndex: number,
  slot?: { label?: string; block?: WorkBlock; simTimeLabel?: string },
): string {
  const block = slot?.block ?? "morning"
  const timeLabel = slot?.simTimeLabel ?? "09:00"
  const slotLabel = slot?.label ?? "Nueva asignación"

  const industryKey = inferIndustryKey(context.industry)
  const industryFocus = INDUSTRY_TASK_FOCUS[industryKey] ?? INDUSTRY_TASK_FOCUS.default
  const cultureText = context.culture?.length ? context.culture.join(", ") : "no especificada"

  return `Genera la ASIGNACION DE TRABAJO #${challengeIndex} para simulacion laboral.

Contexto:
- Rol: ${context.role_title}
- Empresa: ${context.company_name}
- Industria: ${context.industry ?? "General"}
- Perfil empresa: ${context.job_description ?? "Empresa profesional"}
- Cultura: ${cultureText}
- Enfoque obligatorio de tareas: ${industryFocus}
- Hora simulada: ${timeLabel}
- Momento: ${slotLabel}
- Bloque: ${block}
- Tareas previas hoy: ${JSON.stringify(context.challenge_titles ?? [])}

IMPORTANTE: Las tareas DEBEN reflejar la industria (${context.industry ?? "General"}). 
Ejemplo: fintech = compliance/fraude/pagos; diseno = UX/research/prototipos; tecnologia = incidentes/code review/arquitectura.

PROHIBIDO: opciones multiples, preguntas quiz, "elige A/B/C".
OBLIGATORIO: entregable profesional real que el candidato redacte/ejecute en texto.

Tipos de entregable válidos: email, document, code_review, bugfix_plan, client_response, report, meeting_notes, backlog_update.

JSON (sin markdown):
{
  "id": ${challengeIndex},
  "title": "título corto tipo ticket Jira/Asana",
  "type": "deliverable",
  "deliverable_type": "email|document|code_review|bugfix_plan|client_response|report|meeting_notes|backlog_update",
  "urgency": "Urgente|Alta|Normal",
  "assigned_by": "nombre y rol del asignador (ej: Laura — Engineering Manager)",
  "work_block": "${block}",
  "sim_time_label": "${timeLabel}",
  "context": "brief del trabajo: situación, stakeholders, restricciones (3-5 oraciones realistas)",
  "deliverable_description": "qué debe entregar exactamente el candidato (específico y medible)",
  "acceptance_criteria": ["criterio 1", "criterio 2", "criterio 3"],
  "time_limit_minutes": 15-90,
  "xp": 300-600,
  "evaluation_criteria": ["calidad", "completitud", "profesionalismo", "impacto"],
  "min_quality_bar": "descripción de entregable mínimo aceptable"
}`
}

/** Mismo motor de contexto que retos laborales — modo entrevista verbal */
export const INTERVIEW_QUESTION_GENERATION_SYSTEM = `Eres un entrevistador IA senior de HYRE.
Generas preguntas de entrevista laboral REALES (verbales), adaptadas al rol, industria y cultura.
NO generes tareas escritas ni entregables — solo preguntas conversacionales para responder en voz.
Referencia la simulación laboral del candidato cuando corresponda (simulation_followup).
Español latinoamericano, tono profesional y empático.`

export function interviewQuestionGenerationPrompt(
  context: ScenarioContext,
  questionIndex: number,
  options?: { difficulty?: string; lastTranscript?: string; suggestedCategory?: string },
): string {
  const industryKey = inferIndustryKey(context.industry)
  const industryFocus = INDUSTRY_TASK_FOCUS[industryKey] ?? INDUSTRY_TASK_FOCUS.default
  const cultureText = context.culture?.length ? context.culture.join(", ") : "no especificada"
  const previous = JSON.stringify(context.interview_question_titles ?? [])
  const difficulty = options?.difficulty ?? "medium"
  const category = options?.suggestedCategory ?? "behavioral"
  const lastAnswer = options?.lastTranscript?.trim()
    ? `\nÚltima respuesta del candidato (adapta la siguiente pregunta):\n${options.lastTranscript.slice(0, 1500)}`
    : ""

  return `Genera la PREGUNA DE ENTREVISTA #${questionIndex} para entrevista en vivo.

Contexto (mismo del simulador laboral):
- Rol: ${context.role_title}
- Empresa: ${context.company_name}
- Industria: ${context.industry ?? "General"}
- Perfil: ${context.job_description ?? "Profesional"}
- Cultura: ${cultureText}
- Enfoque de industria: ${industryFocus}
- Preguntas previas: ${previous}
- Categoría sugerida: ${category}
- Dificultad: ${difficulty}
- Tareas de simulación previas: ${JSON.stringify(context.challenge_titles ?? [])}
${lastAnswer}

JSON (sin markdown):
{
  "id": ${questionIndex},
  "text": "pregunta en 1-3 oraciones, lista para leer en voz alta",
  "category": "intro|behavioral|technical|situational|culture|simulation_followup|closing",
  "difficulty": "easy|medium|hard",
  "focus_area": "tema evaluado",
  "interviewer_notes": "qué buscar en la respuesta"
}`
}

export const INTERVIEW_EVALUATION_SYSTEM = `Eres evaluador senior de entrevistas HYRE (Gemini Pro).
Analizas respuestas habladas del candidato en tiempo real: comunicación, confianza, relevancia y profundidad.
Sin sesgos por apariencia. Evidencia en el texto transcrito. Español.`

export function interviewEvaluationPrompt(
  context: ScenarioContext,
  question: InterviewQuestion,
  transcript: string,
): string {
  return `Evalúa esta respuesta de entrevista en vivo.

Rol: ${context.role_title} en ${context.company_name} (${context.industry ?? "General"})
Pregunta (${question.category}, ${question.difficulty}): ${question.text}
Área de foco: ${question.focus_area}

Transcripción del candidato:
${transcript}

JSON:
{
  "score": 0-100,
  "communication": 0-100,
  "confidence": 0-100,
  "relevance": 0-100,
  "technical_depth": 0-100,
  "feedback": "2-3 oraciones directas",
  "strengths": ["..."],
  "improvements": ["..."],
  "passed": true/false
}

Reglas: passed=false si score<55. Sé exigente pero justo.`
}

export const OPENING_MESSAGE = (role: string, company: string) =>
  `**Bienvenido a tu jornada simulada en ${company}**

Entras como **${role}**. Hoy vivirás un día laboral real: recibirás asignaciones de trabajo con plazos, las mismas que exigiría la empresa — correos, entregables, incidentes, revisiones.

**Cómo funciona:**
- Recibirás tareas automáticas a lo largo del día (notificaciones en horario laboral).
- Cada tarea tiene **deadline** — entrégala escribiendo tu trabajo completo en el chat.
- La evaluación es **exigente**: calidad profesional real, no respuestas de quiz.

Escribe **«empezar jornada»** para recibir tu primera asignación, o espera la notificación de las 09:00.`
