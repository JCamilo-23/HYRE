import { NextRequest, NextResponse } from "next/server"
import { getCvFallbackAnalysis } from "@/lib/cv-fallback"
import { getGeminiApiKey, getGeminiModels } from "@/lib/gemini-server"
import type { CvAnalysis } from "@/lib/hyre-types"

const MAX_FILE_BYTES = 5 * 1024 * 1024
const ALLOWED_MIME = new Set([
  "application/pdf",
  "text/plain",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
])

const CV_SYSTEM_PROMPT = `Eres un experto en reclutamiento y analisis de CVs para HYRE.
Analiza el curriculum y extrae informacion precisa en espanol (Latinoamerica).
Responde UNICAMENTE con JSON valido, sin markdown ni texto adicional.`

const CV_JSON_SCHEMA = `{
  "summary": "resumen de 2-3 oraciones del perfil",
  "keyPoints": ["punto clave 1", "punto clave 2", "..."],
  "skills": ["habilidad1", "habilidad2", "..."],
  "experience": [{ "role": "cargo", "company": "empresa", "duration": "periodo" }],
  "education": ["formacion 1", "..."],
  "strengths": ["fortaleza 1", "..."],
  "suggestions": ["sugerencia de mejora 1", "..."]
}`

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

async function analyzeWithGemini(
  apiKey: string,
  parts: { text?: string; inlineData?: { mimeType: string; data: string } }[],
): Promise<CvAnalysis | null> {
  const userParts = parts.map((p) => {
    if (p.inlineData) {
      return {
        inline_data: {
          mime_type: p.inlineData.mimeType,
          data: p.inlineData.data,
        },
      }
    }
    return { text: p.text ?? "" }
  })

  userParts.push({
    text: `Extrae los puntos clave de este CV. Estructura requerida:\n${CV_JSON_SCHEMA}`,
  })

  for (const model of getGeminiModels()) {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: CV_SYSTEM_PROMPT }] },
          contents: [{ role: "user", parts: userParts }],
          generationConfig: { temperature: 0.4, maxOutputTokens: 2048 },
        }),
      },
    )

    if (!res.ok) {
      console.warn(`Gemini CV ${model}:`, await res.text())
      continue
    }

    const data = (await res.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[]
    }
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
    if (text) {
      const analysis = parseAnalysis(text)
      if (analysis) return analysis
    }
  }

  return null
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") ?? ""
    const apiKey = getGeminiApiKey()

    if (contentType.includes("application/json")) {
      const body = (await request.json()) as { text?: string; fileName?: string }
      const text = body.text?.trim()

      if (!text || text.length < 50) {
        return NextResponse.json(
          { error: "El texto del CV es muy corto. Minimo 50 caracteres." },
          { status: 400 },
        )
      }

      if (!apiKey) {
        return NextResponse.json({ analysis: getCvFallbackAnalysis(body.fileName), fallback: true })
      }

      const analysis = await analyzeWithGemini(apiKey, [{ text }])
      return NextResponse.json({
        analysis: analysis ?? getCvFallbackAnalysis(body.fileName),
        fallback: !analysis,
      })
    }

    const formData = await request.formData()
    const file = formData.get("file")

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No se recibio ningun archivo." }, { status: 400 })
    }

    if (file.size > MAX_FILE_BYTES) {
      return NextResponse.json({ error: "El archivo supera el limite de 5 MB." }, { status: 400 })
    }

    if (!ALLOWED_MIME.has(file.type) && !file.name.match(/\.(pdf|txt|doc|docx)$/i)) {
      return NextResponse.json(
        { error: "Formato no soportado. Usa PDF o TXT." },
        { status: 400 },
      )
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const isPdf = file.type === "application/pdf" || file.name.endsWith(".pdf")
    const isTxt = file.type === "text/plain" || file.name.endsWith(".txt")

    if (!apiKey) {
      return NextResponse.json({ analysis: getCvFallbackAnalysis(file.name), fallback: true })
    }

    if (isPdf) {
      const analysis = await analyzeWithGemini(apiKey, [
        {
          inlineData: {
            mimeType: "application/pdf",
            data: buffer.toString("base64"),
          },
        },
      ])
      return NextResponse.json({
        analysis: analysis ?? getCvFallbackAnalysis(file.name),
        fallback: !analysis,
      })
    }

    if (isTxt) {
      const text = buffer.toString("utf-8").trim()
      if (text.length < 50) {
        return NextResponse.json(
          { error: "El CV en texto es muy corto." },
          { status: 400 },
        )
      }
      const analysis = await analyzeWithGemini(apiKey, [{ text }])
      return NextResponse.json({
        analysis: analysis ?? getCvFallbackAnalysis(file.name),
        fallback: !analysis,
      })
    }

    return NextResponse.json(
      { error: "DOC/DOCX aun no soportado. Sube PDF o TXT." },
      { status: 400 },
    )
  } catch (error) {
    console.error("CV analyze error:", error)
    return NextResponse.json({ error: "Error al analizar el CV." }, { status: 500 })
  }
}
