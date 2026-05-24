import { NextResponse } from "next/server"
import { getInterviewBackendUrl } from "@/lib/interview-backend"
import { hasGeminiApiKey } from "@/lib/gemini-interview-client"

export async function GET() {
  const backend = getInterviewBackendUrl()
  const frontendGemini = hasGeminiApiKey()

  try {
    const [root, engine] = await Promise.all([
      fetch(`${backend}/health`, { signal: AbortSignal.timeout(5000) }),
      fetch(`${backend}/api/v1/interviews/health`, { signal: AbortSignal.timeout(5000) }),
    ])
    const rootOk = root.ok
    const engineOk = engine.ok
    const engineBody = engineOk ? await engine.json() : null
    const backendGemini = Boolean(engineBody?.gemini_configured)
    const geminiConfigured = backendGemini || frontendGemini

    return NextResponse.json({
      ok: rootOk && engineOk,
      backend_url: backend,
      api: rootOk ? await root.json() : null,
      interview_engine: engineBody,
      gemini_configured: geminiConfigured,
      gemini_source: backendGemini ? "backend" : frontendGemini ? "frontend" : "none",
    })
  } catch {
    return NextResponse.json(
      {
        ok: false,
        backend_url: backend,
        gemini_configured: frontendGemini,
        gemini_source: frontendGemini ? "frontend" : "none",
        detail:
          "Backend FastAPI no disponible. En otra terminal: cd backend && uvicorn app.main:app --reload --port 8000",
      },
      { status: 503 },
    )
  }
}
