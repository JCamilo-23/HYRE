import { NextResponse } from "next/server"

const SYSTEM_PROMPT = `Eres Alex, un entrevistador profesional de HYRE, la plataforma líder de reclutamiento en Latinoamérica.
Tu tono es cálido, profesional y motivador. Hablas exclusivamente en español.
Haz preguntas de entrevista de una en una, escucha atentamente y haz seguimiento natural.
Evalúa: habilidades técnicas, comunicación, trabajo en equipo, liderazgo y cultura.
Después de 7-8 intercambios completos, cierra la entrevista con una frase de despedida y termina con la palabra FINALIZAR.
Empieza con una bienvenida breve y tu primera pregunta.`

export async function POST() {
  const key = process.env.OPENAI_API_KEY
  if (!key) {
    return NextResponse.json({ detail: "OPENAI_API_KEY no configurado" }, { status: 500 })
  }

  const res = await fetch("https://api.openai.com/v1/realtime/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-realtime-preview-2024-12-17",
      voice: "alloy",
      instructions: SYSTEM_PROMPT,
      input_audio_transcription: { model: "whisper-1" },
      turn_detection: {
        type: "server_vad",
        threshold: 0.5,
        prefix_padding_ms: 300,
        silence_duration_ms: 800,
      },
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    return NextResponse.json({ detail: err }, { status: res.status })
  }

  const data = await res.json()
  return NextResponse.json({ client_secret: data.client_secret })
}
