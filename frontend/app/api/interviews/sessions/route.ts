import { NextRequest, NextResponse } from "next/server"
import { getInterviewBackendUrl } from "@/lib/interview-backend"
import { generateInterviewQuestion, hasGeminiApiKey } from "@/lib/gemini-interview-client"

export async function POST(request: NextRequest) {
  const backend = getInterviewBackendUrl()
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ detail: "Invalid JSON body" }, { status: 400 })
  }

  try {
    const res = await fetch(`${backend}/api/v1/interviews/sessions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(30_000),
    })
    const text = await res.text()
    if (!res.ok) {
      return new NextResponse(text, {
        status: res.status,
        headers: { "Content-Type": "application/json" },
      })
    }

    const data = JSON.parse(text) as {
      session_id: string
      ws_url: string
      status: string
      opening_question?: string | null
      gemini_ready?: boolean
    }

    if (!data.opening_question && hasGeminiApiKey()) {
      try {
        data.opening_question = await generateInterviewQuestion(
          process.env.GEMINI_API_KEY!,
          String(body.job_context || "Desarrollador — HYRE"),
        )
        data.gemini_ready = true
      } catch (e) {
        console.warn("[interviews/sessions] frontend Gemini question failed:", e)
      }
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("[interviews/sessions] proxy error:", error)
    return NextResponse.json(
      {
        detail:
          "No se pudo conectar con el backend FastAPI. Ejecuta: cd backend && uvicorn app.main:app --reload --port 8000",
        backend_url: backend,
      },
      { status: 503 },
    )
  }
}
