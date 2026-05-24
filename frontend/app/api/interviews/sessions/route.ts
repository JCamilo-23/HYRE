import { NextRequest, NextResponse } from "next/server"
import { getInterviewBackendUrl } from "@/lib/interview-backend"

export async function POST(request: NextRequest) {
  const backend = getInterviewBackendUrl()
  let body: unknown
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
    return new NextResponse(text, {
      status: res.status,
      headers: { "Content-Type": "application/json" },
    })
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
