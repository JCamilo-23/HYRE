import type { CvAnalysis } from "@/lib/hyre-types"

const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta/models"
const REQUEST_TIMEOUT_MS = 55_000

export function getGeminiVisionModels(): string[] {
  const primary = process.env.GEMINI_VISION_MODEL ?? process.env.GEMINI_MODEL ?? "gemini-2.5-flash"
  return [...new Set([
    primary,
    "gemini-2.5-flash",
    "gemini-flash-latest",
    "gemini-2.5-pro",
  ])]
}

const CV_JSON_SCHEMA = {
  type: "OBJECT",
  properties: {
    extractedText: {
      type: "STRING",
      description: "Transcripcion literal de todo el texto visible en el CV",
    },
    summary: { type: "STRING" },
    keyPoints: { type: "ARRAY", items: { type: "STRING" } },
    skills: { type: "ARRAY", items: { type: "STRING" } },
    experience: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          role: { type: "STRING" },
          company: { type: "STRING" },
          duration: { type: "STRING" },
        },
        required: ["role", "company", "duration"],
      },
    },
    education: { type: "ARRAY", items: { type: "STRING" } },
    strengths: { type: "ARRAY", items: { type: "STRING" } },
    suggestions: { type: "ARRAY", items: { type: "STRING" } },
  },
  required: [
    "extractedText",
    "summary",
    "keyPoints",
    "skills",
    "experience",
    "education",
    "strengths",
    "suggestions",
  ],
}

const TEXT_ONLY_SCHEMA = {
  type: "OBJECT",
  properties: {
    summary: { type: "STRING" },
    keyPoints: { type: "ARRAY", items: { type: "STRING" } },
    skills: { type: "ARRAY", items: { type: "STRING" } },
    experience: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          role: { type: "STRING" },
          company: { type: "STRING" },
          duration: { type: "STRING" },
        },
        required: ["role", "company", "duration"],
      },
    },
    education: { type: "ARRAY", items: { type: "STRING" } },
    strengths: { type: "ARRAY", items: { type: "STRING" } },
    suggestions: { type: "ARRAY", items: { type: "STRING" } },
  },
  required: ["summary", "keyPoints", "skills", "experience", "education", "strengths", "suggestions"],
}

type GeminiPart =
  | { text: string }
  | { inline_data: { mime_type: string; data: string } }

type GeminiErrorBody = {
  error?: { code?: number; message?: string; status?: string }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function parseRetryDelayMs(message: string): number | null {
  const match = message.match(/retry in ([0-9.]+)s/i)
  return match ? Math.ceil(parseFloat(match[1]) * 1000) : null
}

async function callGeminiOnce(
  apiKey: string,
  model: string,
  systemPrompt: string,
  parts: GeminiPart[],
  options?: { json?: boolean; schema?: Record<string, unknown>; temperature?: number; maxTokens?: number },
): Promise<{ text: string | null; error?: string; retryable?: boolean }> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    const generationConfig: Record<string, unknown> = {
      temperature: options?.temperature ?? 0.1,
      maxOutputTokens: options?.maxTokens ?? 8192,
    }

    if (options?.json) {
      generationConfig.responseMimeType = "application/json"
      generationConfig.responseSchema = options.schema ?? CV_JSON_SCHEMA
    }

    const res = await fetch(`${GEMINI_BASE}/${model}:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: "user", parts }],
        generationConfig,
      }),
    })

    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as GeminiErrorBody
      const message = body.error?.message ?? `HTTP ${res.status}`
      console.warn(`Gemini CV [${model}]:`, message)
      const retryable = res.status === 429 || body.error?.status === "RESOURCE_EXHAUSTED"
      return { text: null, error: message, retryable }
    }

    const data = (await res.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[]
    }

    return { text: data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? null }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error de red con Gemini"
    console.warn(`Gemini CV [${model}] request failed:`, message)
    return { text: null, error: message, retryable: message.includes("abort") }
  } finally {
    clearTimeout(timeout)
  }
}

async function callGeminiWithFallback(
  apiKey: string,
  systemPrompt: string,
  parts: GeminiPart[],
  options?: { json?: boolean; schema?: Record<string, unknown>; temperature?: number; maxTokens?: number },
): Promise<{ text: string | null; lastError?: string }> {
  let lastError: string | undefined

  for (const model of getGeminiVisionModels()) {
    for (let attempt = 0; attempt < 2; attempt++) {
      const result = await callGeminiOnce(apiKey, model, systemPrompt, parts, options)
      if (result.text) return { text: result.text }

      lastError = result.error
      if (result.retryable && result.error) {
        const delay = parseRetryDelayMs(result.error) ?? 2000 * (attempt + 1)
        await sleep(Math.min(delay, 8000))
        continue
      }
      break
    }
  }

  return { text: null, lastError }
}

function stripJsonFences(raw: string): string {
  let text = raw.trim()
  if (text.startsWith("```")) {
    text = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "")
  }
  return text.trim()
}

function normalizeAnalysis(parsed: Partial<CvAnalysis>): CvAnalysis | null {
  if (!parsed.summary || !Array.isArray(parsed.keyPoints)) return null
  return {
    summary: parsed.summary,
    keyPoints: parsed.keyPoints ?? [],
    skills: parsed.skills ?? [],
    experience: parsed.experience ?? [],
    education: parsed.education ?? [],
    strengths: parsed.strengths ?? [],
    suggestions: parsed.suggestions ?? [],
  }
}

function parseVisionResponse(raw: string): { analysis: CvAnalysis; extractedText: string } | null {
  try {
    const parsed = JSON.parse(stripJsonFences(raw)) as Partial<CvAnalysis> & { extractedText?: string }
    const analysis = normalizeAnalysis(parsed)
    const extractedText = parsed.extractedText?.trim()
    if (!analysis || !extractedText || extractedText.length < 20) return null
    return { analysis, extractedText }
  } catch {
    return null
  }
}

function parseTextResponse(raw: string): CvAnalysis | null {
  try {
    return normalizeAnalysis(JSON.parse(stripJsonFences(raw)) as Partial<CvAnalysis>)
  } catch {
    return null
  }
}

const VISION_SYSTEM = `Eres un experto en OCR y analisis de CVs para HYRE.
Recibes una imagen o PDF de curriculum vitae.

Proceso obligatorio:
1. Lee TODO el texto visible en el documento (OCR).
2. Escribe la transcripcion literal completa en extractedText.
3. Analiza UNICAMENTE ese texto para los demas campos.

Reglas estrictas:
- NO inventes datos que no aparezcan en el documento.
- Nombres, empresas, fechas y titulos deben ser exactos a lo visible.
- Si un dato no aparece, deja arrays vacios o indica "No especificado en el CV".
- Responde en espanol latinoamericano.
- Responde SOLO con JSON valido.`

const TEXT_SYSTEM = `Eres un analista de CVs para HYRE.
Analiza UNICAMENTE el texto proporcionado. NO inventes informacion.
Responde en espanol latinoamericano. Responde SOLO con JSON valido.`

export async function analyzeCvFromImageOrPdf(
  apiKey: string,
  mimeType: string,
  base64: string,
): Promise<{ analysis: CvAnalysis; extractedText: string } | { error: string }> {
  const isImage = mimeType.startsWith("image/")

  const instruction = isImage
    ? `Analiza esta imagen de CV.
Primero transcribe literalmente todo el texto visible en extractedText.
Luego extrae resumen, puntos clave verificables, habilidades, experiencia, educacion, fortalezas y sugerencias basadas SOLO en ese texto.`
    : `Analiza este PDF de CV.
Primero transcribe literalmente todo el texto del documento en extractedText.
Luego extrae los campos de analisis basados SOLO en ese texto.`

  const parts: GeminiPart[] = [
    { inline_data: { mime_type: mimeType, data: base64 } },
    { text: instruction },
  ]

  const { text, lastError } = await callGeminiWithFallback(apiKey, VISION_SYSTEM, parts, {
    json: true,
    schema: CV_JSON_SCHEMA,
    temperature: 0.1,
    maxTokens: 8192,
  })

  if (!text) {
    return {
      error: lastError?.includes("quota") || lastError?.includes("429")
        ? "Cuota de Gemini agotada. Espera un minuto e intenta de nuevo."
        : "No se pudo leer el CV con IA. Verifica que la imagen sea legible.",
    }
  }

  const parsed = parseVisionResponse(text)
  if (!parsed) {
    return { error: "La IA no pudo interpretar el CV. Prueba con mejor calidad de imagen." }
  }

  return parsed
}

export async function analyzeCvFromPlainText(
  apiKey: string,
  text: string,
): Promise<{ analysis: CvAnalysis } | { error: string }> {
  const prompt = `Analiza este CV:

--- INICIO ---
${text}
--- FIN ---

Extrae resumen, puntos clave, habilidades, experiencia, educacion, fortalezas y sugerencias.
Usa SOLO informacion presente en el texto.`

  const { text: raw, lastError } = await callGeminiWithFallback(apiKey, TEXT_SYSTEM, [{ text: prompt }], {
    json: true,
    schema: TEXT_ONLY_SCHEMA,
    temperature: 0.1,
    maxTokens: 4096,
  })

  if (!raw) {
    return { error: lastError ?? "No se pudo analizar el CV." }
  }

  const analysis = parseTextResponse(raw)
  if (!analysis) {
    return { error: "Respuesta invalida de la IA." }
  }

  return { analysis }
}
