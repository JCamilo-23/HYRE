import { NextResponse } from "next/server"
import { getInterviewBackendUrl } from "@/lib/interview-backend"

export async function GET() {
  const backend = getInterviewBackendUrl()
  try {
    const res = await fetch(`${backend}/api/v1/interviews/agents`, {
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    })
    const text = await res.text()
    return new NextResponse(text, {
      status: res.status,
      headers: { "Content-Type": "application/json" },
    })
  } catch {
    return NextResponse.json({ agents: [] }, { status: 503 })
  }
}
