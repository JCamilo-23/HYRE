import { NextRequest, NextResponse } from "next/server"
import { getInterviewBackendUrl } from "@/lib/interview-backend"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  const { sessionId } = await params
  const backend = getInterviewBackendUrl()
  try {
    const res = await fetch(`${backend}/api/v1/interviews/sessions/${sessionId}/scores`, {
      signal: AbortSignal.timeout(15_000),
    })
    const text = await res.text()
    return new NextResponse(text, {
      status: res.status,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("[interviews/scores] proxy error:", error)
    return NextResponse.json({ detail: "Backend unavailable" }, { status: 503 })
  }
}
