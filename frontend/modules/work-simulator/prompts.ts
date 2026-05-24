import type { ScenarioContext } from "./types"

export const WORK_SIMULATOR_SYSTEM = `Eres el motor de simulación laboral de JobFlow (Hyre).
Simulas un entorno de trabajo realista para practicar habilidades profesionales.
Reglas:
- Mantén coherencia con el rol, empresa y contexto.
- Actúa como compañeros, líderes o clientes según la situación.
- Plantea retos: decisiones, correos, crisis, priorización, feedback.
- Responde en español (Latinoamérica), tono profesional pero cercano.
- 2-4 párrafos máximo salvo que pidan detalle.`

export const CHALLENGE_GENERATION_SYSTEM =
  "Eres un diseñador de simulaciones laborales. Generas retos realistas y medibles."

export function buildSimulatorSystem(context: ScenarioContext): string {
  const reqText =
    context.requirements?.length ? context.requirements.join(", ") : "no especificados"

  return `${WORK_SIMULATOR_SYSTEM}

Contexto activo:
- Rol: ${context.role_title ?? "Profesional"}
- Empresa: ${context.company_name ?? "la empresa"}
- Descripción: ${context.job_description ?? "General"}
- Requisitos: ${reqText}
- Fase: ${context.phase ?? "día laboral"}
- Retos completados: ${context.challenges_completed ?? 0}`
}

export function challengeGenerationPrompt(
  context: ScenarioContext,
  challengeIndex: number,
): string {
  return `Genera el reto laboral #${challengeIndex} para esta simulación.

Contexto:
- Rol: ${context.role_title}
- Empresa: ${context.company_name}
- Retos previos: ${JSON.stringify(context.challenge_titles ?? [])}

Tipos: decision, written, crisis, prioritization, collaboration.

JSON:
{
  "id": ${challengeIndex},
  "title": "...",
  "type": "decision|written|crisis|prioritization|collaboration",
  "urgency": "Urgente|Normal|Opcional",
  "context": "situación en 2-3 oraciones",
  "options": [{"id": "A", "text": "..."}] o null si es written,
  "time_limit_minutes": 5-30,
  "xp": 200-500,
  "evaluation_criteria": ["criterio1", "criterio2"]
}`
}

export const OPENING_MESSAGE = (
  role: string,
  company: string,
) =>
  `Bienvenido a tu simulación de día laboral. Soy tu entorno de práctica: te plantearé situaciones reales de ${role} en ${company}. Cuando estés listo, escribe «empezar» o cuéntame cómo te gustaría enfocar la práctica.`
