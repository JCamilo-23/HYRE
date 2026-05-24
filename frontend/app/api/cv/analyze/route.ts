import { NextRequest, NextResponse } from "next/server"
import {
  analyzeCvFromImageOrPdf,
  analyzeCvFromPlainText,
} from "@/lib/cv-analyzer"
import { getGeminiApiKey } from "@/lib/gemini-server"

export const runtime = "nodejs"
export const maxDuration = 60

const MAX_FILE_BYTES = 4 * 1024 * 1024

const ALLOWED_MIME = new Set([
  "application/pdf",
  "text/plain",
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
])

function resolveMimeType(file: File): string | null {
  if (file.type && ALLOWED_MIME.has(file.type)) return file.type

  const ext = file.name.split(".").pop()?.toLowerCase()
  const byExt: Record<string, string> = {
    pdf: "application/pdf",
    txt: "text/plain",
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    webp: "image/webp",
  }

  return ext ? (byExt[ext] ?? null) : null
}

function isImageMime(mime: string): boolean {
  return mime.startsWith("image/")
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = getGeminiApiKey()

    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "Analisis con IA no disponible. Configura GEMINI_API_KEY en el servidor.",
        },
        { status: 503 },
      )
    }

    const contentType = request.headers.get("content-type") ?? ""

    if (contentType.includes("application/json")) {
      const body = (await request.json()) as { text?: string }
      const text = body.text?.trim()

      if (!text || text.length < 50) {
        return NextResponse.json(
          { error: "El texto del CV es muy corto. Minimo 50 caracteres." },
          { status: 400 },
        )
      }

      const result = await analyzeCvFromPlainText(apiKey, text)
      if ("error" in result) {
        return NextResponse.json({ error: result.error }, { status: 422 })
      }

      return NextResponse.json({ analysis: result.analysis, extractedText: text, source: "text" })
    }

    const formData = await request.formData()
    const file = formData.get("file")

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No se recibio ningun archivo." }, { status: 400 })
    }

    if (file.size > MAX_FILE_BYTES) {
      return NextResponse.json({ error: "El archivo supera el limite de 4 MB." }, { status: 400 })
    }

    const mimeType = resolveMimeType(file)
    if (!mimeType) {
      return NextResponse.json(
        { error: "Formato no soportado. Usa PDF, PNG, JPG o TXT." },
        { status: 400 },
      )
    }

    const buffer = Buffer.from(await file.arrayBuffer())

    if (mimeType === "text/plain") {
      const text = buffer.toString("utf-8").trim()
      if (text.length < 50) {
        return NextResponse.json({ error: "El CV en texto es muy corto." }, { status: 400 })
      }

      const result = await analyzeCvFromPlainText(apiKey, text)
      if ("error" in result) {
        return NextResponse.json({ error: result.error }, { status: 422 })
      }

      return NextResponse.json({ analysis: result.analysis, extractedText: text, source: "text" })
    }

    const base64 = buffer.toString("base64")
    const result = await analyzeCvFromImageOrPdf(apiKey, mimeType, base64)

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 422 })
    }

    return NextResponse.json({
      analysis: result.analysis,
      extractedText: result.extractedText,
      source: isImageMime(mimeType) ? "vision" : "document",
    })
  } catch (error) {
    console.error("CV analyze error:", error)
    return NextResponse.json(
      { error: "Error interno al analizar el CV. Intenta de nuevo." },
      { status: 500 },
    )
  }
}
