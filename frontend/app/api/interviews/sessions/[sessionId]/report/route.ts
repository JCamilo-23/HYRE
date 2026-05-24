import { NextResponse } from "next/server"
import { getInterviewBackendUrl } from "@/lib/interview-backend"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  const { sessionId } = await params
  const backend = getInterviewBackendUrl()
  try {
    const res = await fetch(`${backend}/api/v1/interviews/sessions/${sessionId}/report`, {
      cache: "no-store",
      signal: AbortSignal.timeout(30_000),
    })
    const text = await res.text()
    return new NextResponse(text, {
      status: res.status,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("[interviews/report] proxy error:", error)
    return NextResponse.json(
      { detail: "No se pudo obtener el informe. ¿Está el backend activo?" },
      { status: 503 },
    )
  }
}
