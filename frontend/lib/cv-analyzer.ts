import type { CvAnalysis } from "@/lib/hyre-types"

const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta/models"

export function getGeminiVisionModels(): string[] {
  const primary = process.env.GEMINI_VISION_MODEL ?? process.env.GEMINI_MODEL ?? "gemini-2.5-flash"
  return [...new Set([
    primary,
    "gemini-2.5-flash",
    "gemini-flash-latest",
    "gemini-2.0-flash",
    "gemini-2.5-pro",
  ])]
}

const OCR_SYSTEM = `Eres un motor de OCR especializado en curriculums vitae.
Tu unica tarea es transcribir el texto visible del documento.
Reglas estrictas:
- Copia SOLO texto que aparece en el documento, palabra por palabra.
- Conserva nombres, fechas, empresas y titulos exactamente como se ven.
- Si una palabra es ilegible escribe [ilegible].
- NO inventes, NO resumas, NO completes informacion faltante.
- Si el archivo no es un CV responde exactamente: NOT_A_CV`

const ANALYSIS_SYSTEM = `Eres un analista de CVs para HYRE.
Recibes texto extraido de un curriculum (OCR). Analiza UNICAMENTE ese texto.
Reglas estrictas:
- Usa SOLO informacion explicitamente presente en el texto.
- NO inventes habilidades, experiencias, empresas ni estudios.
- Si un campo no aparece en el texto, deja el array vacio o indica "No especificado en el CV" en el resumen.
- Los puntos clave deben ser hechos verificables del texto, no suposiciones.
- Las sugerencias pueden ser genericas de mejora de CV, pero los demas campos deben ser fieles al documento.
Responde en espanol latinoamericano.`

const CV_JSON_SCHEMA = {
  type: "OBJECT",
  properties: {
    summary: { type: "STRING", description: "Resumen basado solo en el texto del CV" },
    keyPoints: {
      type: "ARRAY",
      items: { type: "STRING" },
      description: "Hechos concretos extraidos del CV",
    },
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

async function callGemini(
  apiKey: string,
  model: string,
  systemPrompt: string,
  parts: GeminiPart[],
  options?: { json?: boolean; temperature?: number; maxTokens?: number },
): Promise<string | null> {
  const generationConfig: Record<string, unknown> = {
    temperature: options?.temperature ?? 0.1,
    maxOutputTokens: options?.maxTokens ?? 4096,
  }

  if (options?.json) {
    generationConfig.responseMimeType = "application/json"
    generationConfig.responseSchema = CV_JSON_SCHEMA
  }

  const res = await fetch(`${GEMINI_BASE}/${model}:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents: [{ role: "user", parts }],
      generationConfig,
    }),
  })

  if (!res.ok) {
    console.warn(`Gemini CV [${model}]:`, await res.text())
    return null
  }

  const data = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[]
  }

  return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? null
}

async function callGeminiWithFallback(
  apiKey: string,
  systemPrompt: string,
  parts: GeminiPart[],
  options?: { json?: boolean; temperature?: number; maxTokens?: number },
): Promise<string | null> {
  for (const model of getGeminiVisionModels()) {
    const text = await callGemini(apiKey, model, systemPrompt, parts, options)
    if (text) return text
  }
  return null
}

function stripJsonFences(raw: string): string {
  let text = raw.trim()
  if (text.startsWith("```")) {
    text = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "")
  }
  return text.trim()
}

function parseAnalysis(raw: string): CvAnalysis | null {
  try {
    const parsed = JSON.parse(stripJsonFences(raw)) as CvAnalysis
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
  } catch {
    return null
  }
}

export async function extractTextFromDocument(
  apiKey: string,
  mimeType: string,
  base64: string,
): Promise<string | null> {
  const isImage = mimeType.startsWith("image/")

  const instruction = isImage
    ? `Esta imagen es un curriculum vitae escaneado o fotografiado.
Transcribe TODO el texto visible en la imagen, de arriba a abajo, seccion por seccion.
Incluye: nombre, contacto, titulo profesional, experiencia, educacion, habilidades y cualquier otro texto legible.
Responde SOLO con la transcripcion literal, sin comentarios adicionales.`
    : `Este PDF es un curriculum vitae.
Extrae TODO el texto del documento de forma literal y completa.
Responde SOLO con la transcripcion, sin comentarios adicionales.`

  const parts: GeminiPart[] = [
    { inline_data: { mime_type: mimeType, data: base64 } },
    { text: instruction },
  ]

  return callGeminiWithFallback(apiKey, OCR_SYSTEM, parts, {
    temperature: 0,
    maxTokens: 8192,
  })
}

export async function analyzeCvText(apiKey: string, cvText: string): Promise<CvAnalysis | null> {
  const prompt = `Analiza el siguiente CV transcrito. Usa UNICAMENTE esta informacion:

--- INICIO CV ---
${cvText}
--- FIN CV ---

Extrae resumen, puntos clave verificables, habilidades mencionadas, experiencia, educacion y fortalezas.
No agregues datos que no esten en el texto.`

  const raw = await callGeminiWithFallback(apiKey, ANALYSIS_SYSTEM, [{ text: prompt }], {
    json: true,
    temperature: 0.1,
    maxTokens: 4096,
  })

  if (!raw) return null
  return parseAnalysis(raw)
}

export async function analyzeCvFromDocument(
  apiKey: string,
  mimeType: string,
  base64: string,
): Promise<{ analysis: CvAnalysis; extractedText: string } | null> {
  const extractedText = await extractTextFromDocument(apiKey, mimeType, base64)

  if (!extractedText || extractedText === "NOT_A_CV") {
    return null
  }

  if (extractedText.trim().length < 30) {
    return null
  }

  const analysis = await analyzeCvText(apiKey, extractedText)
  if (!analysis) return null

  return { analysis, extractedText }
}

export async function analyzeCvFromPlainText(
  apiKey: string,
  text: string,
): Promise<CvAnalysis | null> {
  return analyzeCvText(apiKey, text)
}
