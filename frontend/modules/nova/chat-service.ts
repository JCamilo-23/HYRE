import { sendCopilotMessage } from "@/modules/copilot"
import { NOVA_SUGGESTIONS } from "./constants"

const MOCK_RESPONSES: Record<string, string> = {
  "¿Cómo puedo mejorar mi score?":
    "Basado en tu último reporte, te recomiendo: 1) Respuestas más estructuradas con método STAR. 2) Mantener contacto visual en cámara. 3) Incluir ejemplos concretos. Mejorar comunicación un 10% puede abrirte más oportunidades.",
  "Prepárame para mi próxima entrevista":
    "Para tu próxima entrevista: 1) Prepara 3 historias de éxito. 2) Investiga la cultura de la empresa. 3) Ten preguntas listas sobre el equipo. ¿Practicamos preguntas comunes?",
  "¿Qué habilidades debo desarrollar?":
    "Según tu perfil y vacantes similares: React avanzado, testing con Jest y soft skills de liderazgo. Enfócate en una por semana para progreso medible.",
  "Analiza mi perfil":
    "Fortalezas: comunicación y trabajo en equipo. Áreas de mejora: liderazgo y profundidad técnica. Completa tu video de presentación para aumentar matches.",
}

function getMockReply(message: string, firstName: string): string {
  const normalized = NOVA_SUGGESTIONS.find(
    (s) => s.toLowerCase() === message.toLowerCase(),
  )
  if (normalized && MOCK_RESPONSES[normalized]) {
    return MOCK_RESPONSES[normalized].replace(/\{name\}/g, firstName)
  }
  return `Entiendo tu pregunta, ${firstName}. Déjame analizar tu perfil y resultados recientes. ¿Qué aspecto te gustaría profundizar?`
}

export async function sendNovaMessage(
  message: string,
  options: { sessionId?: string | null; firstName: string },
): Promise<{ reply: string; sessionId: string }> {
  try {
    const res = await sendCopilotMessage(message, options.sessionId ?? undefined)
    return { reply: res.reply, sessionId: res.session_id }
  } catch {
    return {
      reply: getMockReply(message, options.firstName),
      sessionId: options.sessionId ?? crypto.randomUUID(),
    }
  }
}

export function buildGreeting(firstName: string): string {
  const name = firstName || "amigo"
  return `Hola ${name}! Soy Nova, tu mentor de carrera IA. Estoy aquí para ayudarte a mejorar tus habilidades y prepararte para el éxito. ¿Qué te gustaría saber hoy?`
}
