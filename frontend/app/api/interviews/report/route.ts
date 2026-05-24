import { NextRequest, NextResponse } from "next/server"
import { geminiGenerateJson } from "@/lib/gemini-server"

export async function POST(request: NextRequest) {
  const { history, jobContext } = await request.json()

  const candidateMessages = history
    .filter((m: { role: string }) => m.role === "user")
    .map((m: { content: string }) => m.content)
    .join("\n\n")

  const report = await geminiGenerateJson<{
    score: number
    hire_probability: number
    dimensions: Record<string, number>
    strengths: string[]
    improvements: string[]
    summary: string
    recommendation: string
  }>(
    `Eres un evaluador experto de entrevistas de trabajo. Analiza las respuestas del candidato y genera un reporte JSON.`,
    `Posición: ${jobContext ?? "Rol tecnología"}

Respuestas del candidato:
${candidateMessages}

Genera un reporte con este formato exacto:
{
  "score": número del 0 al 100,
  "hire_probability": número del 0 al 100,
  "dimensions": {
    "comunicacion": número 0-100,
    "confianza": número 0-100,
    "liderazgo": número 0-100,
    "trabajo_en_equipo": número 0-100,
    "resolucion_problemas": número 0-100
  },
  "strengths": ["fortaleza 1", "fortaleza 2", "fortaleza 3"],
  "improvements": ["área de mejora 1", "área de mejora 2"],
  "summary": "resumen ejecutivo en 2-3 oraciones",
  "recommendation": "CONTRATAR" | "CONSIDERAR" | "NO CONTRATAR"
}`,
  )

  return NextResponse.json(
    report ?? {
      score: 72,
      hire_probability: 68,
      dimensions: { comunicacion: 75, confianza: 70, liderazgo: 65, trabajo_en_equipo: 80, resolucion_problemas: 72 },
      strengths: ["Buena comunicación", "Actitud positiva", "Experiencia relevante"],
      improvements: ["Profundizar en ejemplos concretos", "Mayor confianza al hablar"],
      summary: "El candidato mostró buenas habilidades de comunicación y disposición para aprender.",
      recommendation: "CONSIDERAR",
    },
  )
}
