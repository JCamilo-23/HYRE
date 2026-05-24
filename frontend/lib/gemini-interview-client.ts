/**
 * Server-only Gemini calls for interview proxy routes (uses GEMINI_API_KEY).
 */

export async function generateInterviewQuestion(
  apiKey: string,
  jobContext: string,
  history: { role: string; content: string }[] = [],
): Promise<string> {
  const models = [
    process.env.GEMINI_PRO_MODEL || "gemini-2.0-flash",
    "gemini-2.0-flash",
    "gemini-1.5-flash",
  ]

  const historyText =
    history.length > 0
      ? history.map((m) => `${m.role}: ${m.content}`).join("\n")
      : "(inicio de entrevista)"

  const prompt = `Puesto: ${jobContext}
Historial:
${historyText}

Genera UNA pregunta de entrevista profesional en español (máximo 2 oraciones). Solo la pregunta, sin introducción.`

  const contents = [{ role: "user", parts: [{ text: prompt }] }]

  for (const model of [...new Set(models)]) {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: "Eres entrevistador IA profesional de HYRE." }],
          },
          contents,
          generationConfig: { temperature: 0.75, maxOutputTokens: 256 },
        }),
      },
    )
    if (!res.ok) continue
    const data = await res.json()
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
    if (text) return text
  }

  throw new Error("Gemini no devolvió una pregunta válida")
}

export function hasGeminiApiKey(): boolean {
  return Boolean(process.env.GEMINI_API_KEY?.trim())
}
