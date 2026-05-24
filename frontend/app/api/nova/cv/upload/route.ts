import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 })

    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const name = (formData.get("name") as string) || "Mi CV"
    const targetRole = formData.get("target_role") as string | null
    const industry = formData.get("industry") as string | null

    if (!file) return NextResponse.json({ error: "Archivo requerido" }, { status: 400 })

    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
      "text/plain",
    ]
    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(pdf|docx|doc|txt)$/i)) {
      return NextResponse.json({ error: "Formato no soportado. Usa PDF, DOCX o TXT." }, { status: 400 })
    }
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "Archivo demasiado grande. Máximo 10MB." }, { status: 400 })
    }

    // Extract text based on file type
    let rawText = ""
    const fileType = file.name.split(".").pop()?.toLowerCase() ?? "pdf"

    if (fileType === "txt") {
      rawText = await file.text()
    } else if (fileType === "docx") {
      rawText = await extractDocxText(file)
    } else {
      // PDF: use Gemini vision to extract text
      rawText = await extractPdfText(file)
    }

    if (!rawText.trim()) {
      return NextResponse.json({ error: "No se pudo extraer texto del archivo." }, { status: 422 })
    }

    // Upload file to Supabase Storage
    const fileBuffer = await file.arrayBuffer()
    const filePath = `cv_uploads/${user.id}/${Date.now()}_${file.name}`
    const { error: storageError } = await supabase.storage
      .from("nova-cvs")
      .upload(filePath, fileBuffer, { contentType: file.type })

    let fileUrl: string | null = null
    if (!storageError) {
      const { data } = supabase.storage.from("nova-cvs").getPublicUrl(filePath)
      fileUrl = data.publicUrl
    }

    // Detect basic sections from text
    const parsedSections = detectSections(rawText)
    const wordCount = rawText.split(/\s+/).filter(Boolean).length

    // Insert CV record
    const { data: cv, error: insertError } = await (supabase as any)
      .from("nova_cvs")
      .insert({
        user_id: user.id,
        name,
        file_url: fileUrl,
        file_type: fileType,
        raw_text: rawText,
        parsed_sections: parsedSections,
        status: "pending",
        target_role: targetRole,
        industry,
        word_count: wordCount,
      })
      .select()
      .single()

    if (insertError) throw new Error(insertError.message)

    return NextResponse.json({ cv_id: cv.id, status: "pending" }, { status: 201 })
  } catch (err: any) {
    console.error("[nova/cv/upload]", err)
    return NextResponse.json({ error: err.message ?? "Error interno" }, { status: 500 })
  }
}

async function extractPdfText(file: File): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return ""

  const base64 = Buffer.from(await file.arrayBuffer()).toString("base64")

  const body = {
    contents: [{
      parts: [
        { text: "Extrae TODO el texto de este CV/hoja de vida tal como aparece. Mantén la estructura. No agregues comentarios." },
        { inline_data: { mime_type: "application/pdf", data: base64 } },
      ]
    }],
    generationConfig: { temperature: 0, maxOutputTokens: 8192 }
  }

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }
  )

  if (!res.ok) return ""
  const data = await res.json()
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? ""
}

async function extractDocxText(file: File): Promise<string> {
  try {
    const mammoth = await import("mammoth")
    const buffer = Buffer.from(await file.arrayBuffer())
    const result = await mammoth.extractRawText({ buffer })
    return result.value
  } catch {
    return ""
  }
}

function detectSections(text: string): Record<string, string> {
  const sections: Record<string, string> = {}
  const lower = text.toLowerCase()

  const sectionPatterns: Record<string, RegExp> = {
    contact: /(?:contacto|contact|email|correo|telefono|phone)/i,
    summary: /(?:resumen|perfil profesional|objective|summary|sobre m[ií])/i,
    experience: /(?:experiencia|experience|historial laboral|trabajo)/i,
    education: /(?:educaci[oó]n|education|estudios|formaci[oó]n)/i,
    skills: /(?:habilidades|skills|competencias|tecnolog[ií]as)/i,
    projects: /(?:proyectos|projects|portafolio)/i,
    certifications: /(?:certificaciones|certifications|cursos)/i,
    languages: /(?:idiomas|languages)/i,
  }

  for (const [key, pattern] of Object.entries(sectionPatterns)) {
    if (pattern.test(lower)) sections[key] = "detected"
  }

  return sections
}
