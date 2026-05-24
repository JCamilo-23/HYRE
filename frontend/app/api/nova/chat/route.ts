import { NextRequest, NextResponse } from "next/server"
import { getNovaFallbackReply } from "@/modules/nova/fallback-replies"

const NOVA_SYSTEM_BASE = `Eres Nova, el mentor de carrera IA de HYRE (JobFlow).
Ayudas a jóvenes a prepararse para entrevistas, mejorar su perfil profesional, desarrollar habilidades y entender simulaciones laborales.
Reglas:
- Responde SIEMPRE en español (Latinoamérica), tono cercano pero profesional.
- Responde de forma directa y útil a lo que el usuario pregunta; NUNCA repitas la misma respuesta genérica.
- Máximo 3 párrafos cortos por respuesta.
- Si el usuario es informal, responde con empatía y redirige hacia temas de carrera.
- Da consejos concretos y accionables.`

interface ChatMessage {
  role: "user" | "assistant"
  content: string
}

function buildSystemPrompt(firstName: string): string {
  const name = firstName && firstName !== "Usuario" ? firstName : "amigo"
  return `${NOVA_SYSTEM_BASE}\n\nEl usuario se llama ${name}.`
}

function getModels(): string[] {
  const primary = process.env.GEMINI_MODEL ?? "gemini-2.5-flash"
  return [...new Set([primary, "gemini-2.5-flash", "gemini-flash-latest", "gemini-2.0-flash"])]
}

async function callGemini(
  apiKey: string,
  model: string,
  systemPrompt: string,
  contents: { role: string; parts: { text: string }[] }[],
): Promise<string | null> {
  const geminiRes = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents,
        generationConfig: { temperature: 0.8, maxOutputTokens: 1024 },
      }),
    },
  )

  if (!geminiRes.ok) {
    console.warn(`Gemini ${model} failed:`, await geminiRes.text())
    return null
  }

  const data = (await geminiRes.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[]
  }

  return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? null
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY

  let body: {
    message?: string
    history?: ChatMessage[]
    firstName?: string
    sessionId?: string | null
  }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ detail: "JSON inválido" }, { status: 400 })
  }

  const message = body.message?.trim()
  if (!message) {
    return NextResponse.json({ detail: "Mensaje vacío" }, { status: 400 })
  }

  const firstName = body.firstName ?? "amigo"
  const history = body.history ?? []
  const sessionId = body.sessionId ?? crypto.randomUUID()

  const contents = history
    .filter((m) => m.content?.trim())
    .map((m) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }],
    }))

  const last = contents[contents.length - 1]
  if (!last || last.role !== "user" || last.parts[0].text !== message) {
    contents.push({ role: "user", parts: [{ text: message }] })
  }

  if (apiKey) {
    const systemPrompt = buildSystemPrompt(firstName)
    for (const model of getModels()) {
      try {
        const reply = await callGemini(apiKey, model, systemPrompt, contents)
        if (reply) {
          return NextResponse.json({ reply, session_id: sessionId })
        }
      } catch (error) {
        console.warn(`Gemini model ${model} error:`, error)
      }
    }
  }

  return NextResponse.json({
    reply: getNovaFallbackReply(message, firstName),
    session_id: sessionId,
    fallback: true,
  })
}
