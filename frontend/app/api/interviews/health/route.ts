import { NextResponse } from "next/server"
import { getInterviewBackendUrl } from "@/lib/interview-backend"

export async function GET() {
  const backend = getInterviewBackendUrl()
  try {
    const [root, engine] = await Promise.all([
      fetch(`${backend}/health`, { signal: AbortSignal.timeout(5000) }),
      fetch(`${backend}/api/v1/interviews/health`, { signal: AbortSignal.timeout(5000) }),
    ])
    const rootOk = root.ok
    const engineOk = engine.ok
    const engineBody = engineOk ? await engine.json() : null
    return NextResponse.json({
      ok: rootOk && engineOk,
      backend_url: backend,
      api: rootOk ? await root.json() : null,
      interview_engine: engineBody,
    })
  } catch {
    return NextResponse.json(
      {
        ok: false,
        backend_url: backend,
        detail:
          "Backend FastAPI no disponible. En otra terminal: cd backend && uvicorn app.main:app --reload --port 8000",
      },
      { status: 503 },
    )
  }
}
