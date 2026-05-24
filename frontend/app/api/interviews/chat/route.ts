import { NextRequest, NextResponse } from "next/server"
import { geminiChat, geminiGenerateText } from "@/lib/gemini-server"

const SYSTEM_PROMPT = `Eres Alex, un entrevistador profesional de HYRE — una plataforma de empleo con IA.
Tu trabajo es hacer una entrevista de trabajo real, amigable pero profesional, en español.

Guía de la entrevista:
1. Empieza con una bienvenida cálida y una pregunta sobre el candidato
2. Haz preguntas sobre experiencia, habilidades y situaciones reales (método STAR)
3. Evalúa comunicación, trabajo en equipo, resolución de problemas y liderazgo
4. Haz entre 6 y 8 preguntas en total
5. Al final, pregunta si tiene dudas y cierra con amabilidad

Reglas:
- Responde SOLO con la siguiente pregunta o comentario, sin explicaciones adicionales
- Sé conversacional y empático
- Si el candidato da una respuesta corta, profundiza con un follow-up
- Habla siempre en español`

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { history, jobContext } = body as {
    history: { role: "user" | "assistant"; content: string }[]
    jobContext?: string
  }

  if (!history) {
    return NextResponse.json({ error: "Missing history" }, { status: 400 })
  }

  // Primera pregunta (apertura)
  if (history.length === 0) {
    const opening = await geminiGenerateText(
      SYSTEM_PROMPT,
      `El candidato está aplicando para: ${jobContext ?? "un rol en tecnología"}. Genera una pregunta de bienvenida corta y profesional para iniciar la entrevista.`,
      { temperature: 0.8, maxTokens: 200 },
    )
    return NextResponse.json({
      reply: opening ?? "¡Hola! Bienvenido a tu entrevista con HYRE. Cuéntame un poco sobre ti y qué te motivó a aplicar a esta posición.",
    })
  }

  const lastUserMessage = history[history.length - 1]?.content ?? ""
  const isEnding = history.filter((m) => m.role === "assistant").length >= 7

  if (isEnding) {
    const closing = await geminiGenerateText(
      SYSTEM_PROMPT,
      `Esta es la última pregunta de la entrevista. La respuesta del candidato fue: "${lastUserMessage}". Cierra la entrevista de forma amigable, agradece su tiempo y dile que recibirá retroalimentación pronto.`,
      { temperature: 0.7, maxTokens: 200 },
    )
    return NextResponse.json({
      reply: closing ?? "¡Muchas gracias por tu tiempo! Ha sido un placer conocerte. Te contactaremos con retroalimentación muy pronto. ¡Mucho éxito!",
      finished: true,
    })
  }

  const reply = await geminiChat(SYSTEM_PROMPT, history, lastUserMessage)
  return NextResponse.json({
    reply: reply ?? "Interesante. ¿Puedes contarme más sobre esa experiencia?",
  })
}
