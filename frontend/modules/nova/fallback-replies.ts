import { NOVA_SUGGESTIONS } from "./constants"

const MOCK_RESPONSES: Record<string, string> = {
  "¿Cómo puedo mejorar mi score?":
    "Basado en tu último reporte, te recomiendo: 1) Respuestas más estructuradas con método STAR. 2) Mantener contacto visual en cámara. 3) Incluir ejemplos concretos.",
  "Prepárame para mi próxima entrevista":
    "Para tu entrevista: 1) Prepara 3 historias de éxito. 2) Investiga la cultura de la empresa. 3) Ten preguntas listas para el reclutador. ¿Simulamos una pregunta?",
  "¿Qué habilidades debo desarrollar?":
    "Prioriza React avanzado, testing con Jest y soft skills de liderazgo según las vacantes que te interesan. Una habilidad por semana.",
  "Analiza mi perfil":
    "Fortalezas típicas: comunicación y trabajo en equipo. Mejora: liderazgo y profundidad técnica. Completa tu video de presentación para más matches.",
}

const KEYWORD_RESPONSES: { keywords: string[]; reply: string }[] = [
  {
    keywords: ["perfil", "cv", "curriculum", "mejorar mi", "mejorar el perfil"],
    reply:
      "Para mejorar tu perfil: 1) Añade 3 logros con números (%, tiempo, usuarios). 2) Lista habilidades técnicas con nivel. 3) Graba un video de 60 s presentándote. 4) Ajusta tu headline a roles concretos. ¿Quieres que revisemos tu headline o experiencia?",
  },
  {
    keywords: ["entrevista", "entrevistas", "preguntas"],
    reply:
      "Para entrevistas usa STAR, investiga la empresa 15 min antes y prepara 2 preguntas inteligentes. Practica respuestas de 90 segundos. ¿Quieres una pregunta de práctica ahora?",
  },
  {
    keywords: ["score", "puntuación", "nota", "resultado", "simulacion", "simulación"],
    reply:
      "Sube tu score con respuestas estructuradas, ejemplos concretos y buen contacto visual en cámara. Completa simulaciones y pide feedback específico. ¿En qué área quieres enfocarte?",
  },
  {
    keywords: ["habilidad", "habilidades", "aprender", "estudiar"],
    reply:
      "Elige una habilidad que aparezca en tus vacantes objetivo, dedica 5 h esta semana y documenta un mini-proyecto. Eso suma mucho en HYRE.",
  },
  {
    keywords: ["trabajo", "empleo", "laboral", "empresa"],
    reply:
      "Para acercarte al empleo ideal: define 3 empresas objetivo, adapta tu perfil a cada una y practica simulaciones del rol. ¿Tienes un puesto en mente?",
  },
  {
    keywords: ["hola", "buenas", "hey", "qué tal", "como estas", "cómo estás"],
    reply:
      "¡Hola! Puedo ayudarte con tu perfil, entrevistas, simulaciones o plan de carrera. ¿Por dónde empezamos?",
  },
]

function normalize(text: string): string {
  return text.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "")
}

export function getNovaFallbackReply(message: string, firstName: string): string {
  const name = firstName && firstName !== "Usuario" ? firstName : "amigo"
  const lower = normalize(message)

  const exact = NOVA_SUGGESTIONS.find((s) => normalize(s) === lower)
  if (exact && MOCK_RESPONSES[exact]) {
    return MOCK_RESPONSES[exact]
  }

  for (const { keywords, reply } of KEYWORD_RESPONSES) {
    if (keywords.some((kw) => lower.includes(normalize(kw)))) {
      return reply
    }
  }

  if (lower.includes("?")) {
    return `${name}, buena pregunta. Si me das un poco más de contexto (tu rol objetivo o situación), te doy pasos concretos. También puedo ayudarte con perfil, entrevistas o simulaciones.`
  }

  return `${name}, estoy aquí para ayudarte con carrera y empleo. ¿Te interesa mejorar tu perfil, preparar una entrevista o practicar una simulación laboral?`
}
