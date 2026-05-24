import { geminiGenerateText } from "@/lib/gemini-server"

export function hasGeminiApiKey(): boolean {
  return Boolean(process.env.GEMINI_API_KEY)
}

export async function generateInterviewQuestion(
  _apiKey: string,
  jobContext: string,
): Promise<string> {
  const text = await geminiGenerateText(
    "Eres un entrevistador profesional de HYRE. Genera una sola pregunta de apertura cálida y profesional en español.",
    `El candidato está aplicando para: ${jobContext}. Genera una pregunta de bienvenida corta.`,
    { temperature: 0.8, maxTokens: 150 },
  )
  return text ?? "Hola, bienvenido a tu entrevista con HYRE. ¿Cómo estás hoy?"
}
