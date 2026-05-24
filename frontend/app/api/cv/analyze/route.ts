import { NextRequest, NextResponse } from "next/server"
import {
  analyzeCvFromDocument,
  analyzeCvFromPlainText,
} from "@/lib/cv-analyzer"
import { getGeminiApiKey } from "@/lib/gemini-server"

const MAX_FILE_BYTES = 5 * 1024 * 1024

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
            "Analisis con IA no disponible. Configura GEMINI_API_KEY en el servidor para leer imagenes y CVs.",
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

      const analysis = await analyzeCvFromPlainText(apiKey, text)
      if (!analysis) {
        return NextResponse.json(
          { error: "No se pudo analizar el CV. Intenta de nuevo." },
          { status: 422 },
        )
      }

      return NextResponse.json({ analysis, extractedText: text, source: "text" })
    }

    const formData = await request.formData()
    const file = formData.get("file")

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No se recibio ningun archivo." }, { status: 400 })
    }

    if (file.size > MAX_FILE_BYTES) {
      return NextResponse.json({ error: "El archivo supera el limite de 5 MB." }, { status: 400 })
    }

    const mimeType = resolveMimeType(file)
    if (!mimeType) {
      return NextResponse.json(
        { error: "Formato no soportado. Usa PDF, PNG, JPG o TXT." },
        { status: 400 },
      )
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const base64 = buffer.toString("base64")

    if (mimeType === "text/plain") {
      const text = buffer.toString("utf-8").trim()
      if (text.length < 50) {
        return NextResponse.json({ error: "El CV en texto es muy corto." }, { status: 400 })
      }

      const analysis = await analyzeCvFromPlainText(apiKey, text)
      if (!analysis) {
        return NextResponse.json(
          { error: "No se pudo analizar el CV." },
          { status: 422 },
        )
      }

      return NextResponse.json({ analysis, extractedText: text, source: "text" })
    }

    const result = await analyzeCvFromDocument(apiKey, mimeType, base64)

    if (!result) {
      const hint = isImageMime(mimeType)
        ? "No se pudo leer la imagen. Asegurate de que sea un CV legible, bien iluminado y con texto claro."
        : "No se pudo leer el documento. Verifica que sea un CV valido."

      return NextResponse.json({ error: hint }, { status: 422 })
    }

    return NextResponse.json({
      analysis: result.analysis,
      extractedText: result.extractedText,
      source: isImageMime(mimeType) ? "vision" : "document",
    })
  } catch (error) {
    console.error("CV analyze error:", error)
    return NextResponse.json({ error: "Error al analizar el CV." }, { status: 500 })
  }
}
