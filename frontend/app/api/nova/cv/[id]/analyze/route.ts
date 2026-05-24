import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

const ANALYZE_PROMPT = `Eres Nova, el AI Career Intelligence System de HYRE.
Actúas como recruiter senior con 15 años en tech LATAM + especialista ATS + career coach.

Analiza el siguiente CV y devuelve ÚNICAMENTE un JSON válido con esta estructura exacta:
{
  "score_general": <0-100>,
  "score_ats": <0-100>,
  "score_technical": <0-100>,
  "score_recruiter": <0-100>,
  "score_visual": <0-100>,
  "score_communication": <0-100>,
  "feedback_summary": "<párrafo de 3-4 oraciones evaluando el CV globalmente, tono directo y profesional>",
  "strengths": [
    { "category": "<categoría>", "description": "<descripción específica>", "evidence": "<cita del CV>" }
  ],
  "weaknesses": [
    { "category": "<categoría>", "description": "<descripción>", "evidence": "<cita del CV>", "impact": "<critical|high|medium|low>" }
  ],
  "ats_issues": [
    { "issue": "<nombre corto>", "description": "<qué problema hay>", "fix": "<cómo corregirlo>" }
  ],
  "keyword_gaps": [
    { "keyword": "<skill o keyword>", "importance": "<critical|important|nice_to_have>", "context": "<por qué es relevante>" }
  ],
  "bullets_analysis": [
    { "original": "<bullet original>", "problem": "<qué está mal>", "suggested": "<versión mejorada>" }
  ],
  "sections_detected": ["<lista de secciones encontradas>"],
  "sections_missing": ["<lista de secciones que faltan>"],
  "top_actions": [
    { "priority": 1, "action": "<acción concreta>", "impact": "<qué mejora>", "time_estimate": "<ej: 5 minutos>" },
    { "priority": 2, "action": "<acción concreta>", "impact": "<qué mejora>", "time_estimate": "<ej: 15 minutos>" },
    { "priority": 3, "action": "<acción concreta>", "impact": "<qué mejora>", "time_estimate": "<ej: 20 minutos>" }
  ],
  "feedback_detailed": {
    "experience": "<feedback específico de la sección experiencia>",
    "education": "<feedback de educación>",
    "skills": "<feedback de habilidades>",
    "general": "<observaciones generales>"
  }
}

Reglas:
- NUNCA inventes información que no está en el CV
- Sé específico, cita texto real del CV
- El feedback debe ser directo, empático y accionable
- Para ATS: detecta tablas, columnas, imágenes, headers problemáticos
- Para bullets: mejora con framework STAR sin inventar métricas
- Devuelve SOLO el JSON, sin markdown ni texto adicional`

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const startTime = Date.now()
  const { id } = await params

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 })

    // Load CV
    const { data: cv, error: cvError } = await (supabase as any)
      .from("nova_cvs")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single()

    if (cvError || !cv) return NextResponse.json({ error: "CV no encontrado" }, { status: 404 })
    if (!cv.raw_text) return NextResponse.json({ error: "CV sin texto extraído" }, { status: 422 })

    // Mark as processing
    await (supabase as any)
      .from("nova_cvs")
      .update({ status: "processing" })
      .eq("id", id)

    // Call Gemini
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) throw new Error("GEMINI_API_KEY no configurada")

    const prompt = `${ANALYZE_PROMPT}\n\n---\nCV A ANALIZAR:\n${cv.raw_text}\n---`

    const models = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-2.0-flash"]
    let analysisJson: Record<string, any> | null = null
    let modelUsed = ""

    for (const model of models) {
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { temperature: 0.2, maxOutputTokens: 4096 }
            })
          }
        )
        if (!res.ok) continue

        const data = await res.json()
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? ""
        const cleaned = text.replace(/```json\n?|\n?```/g, "").trim()
        analysisJson = JSON.parse(cleaned)
        modelUsed = model
        break
      } catch {
        continue
      }
    }

    if (!analysisJson) throw new Error("No se pudo generar el análisis")

    const processingTime = Date.now() - startTime

    // Save analysis
    const { data: analysis, error: saveError } = await (supabase as any)
      .from("nova_analyses")
      .insert({
        cv_id: id,
        user_id: user.id,
        score_general: clamp(analysisJson.score_general),
        score_ats: clamp(analysisJson.score_ats),
        score_technical: clamp(analysisJson.score_technical),
        score_recruiter: clamp(analysisJson.score_recruiter),
        score_visual: clamp(analysisJson.score_visual),
        score_communication: clamp(analysisJson.score_communication),
        strengths: analysisJson.strengths ?? [],
        weaknesses: analysisJson.weaknesses ?? [],
        ats_issues: analysisJson.ats_issues ?? [],
        keyword_gaps: analysisJson.keyword_gaps ?? [],
        bullets_analysis: analysisJson.bullets_analysis ?? [],
        sections_detected: analysisJson.sections_detected ?? [],
        sections_missing: analysisJson.sections_missing ?? [],
        top_actions: analysisJson.top_actions ?? [],
        feedback_summary: analysisJson.feedback_summary ?? "",
        feedback_detailed: analysisJson.feedback_detailed ?? {},
        model_used: modelUsed,
        processing_time_ms: processingTime,
      })
      .select()
      .single()

    if (saveError) throw new Error(saveError.message)

    // Mark CV as ready
    await (supabase as any)
      .from("nova_cvs")
      .update({
        status: "ready",
        parsed_sections: { sections_detected: analysisJson.sections_detected ?? [] }
      })
      .eq("id", id)

    return NextResponse.json({ analysis_id: analysis.id, status: "ready" })
  } catch (err: any) {
    // Mark CV as error
    try {
      const supabase = await createClient()
      await (supabase as any)
        .from("nova_cvs")
        .update({ status: "error", error_message: err.message })
        .eq("id", id)
    } catch {}

    console.error("[nova/cv/analyze]", err)
    return NextResponse.json({ error: err.message ?? "Error en análisis" }, { status: 500 })
  }
}

function clamp(v: any): number {
  const n = Number(v)
  if (isNaN(n)) return 50
  return Math.max(0, Math.min(100, Math.round(n)))
}
