import { NextRequest, NextResponse } from "next/server"
import { processEvaluation } from "@/modules/work-simulator/service"
import { getSession, saveSession } from "@/lib/work-simulator-session-store"
import { createClient } from "@/lib/supabase/server"

type Params = { params: Promise<{ id: string }> }

export async function POST(request: NextRequest, { params }: Params) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ detail: "No autorizado" }, { status: 401 })
  }

  const { id } = await params
  const session = await getSession(id, supabase)

  if (!session) {
    return NextResponse.json({ detail: "Sesión no encontrada" }, { status: 404 })
  }

  const body = await request.json()
  const response = body.response?.trim()
  if (!response) {
    return NextResponse.json({ detail: "Respuesta vacía" }, { status: 400 })
  }

  try {
    const result = await processEvaluation(session, response)
    await saveSession(result.session, supabase)

    // Si la sesión está vinculada a una vacante, escribir resultado en job_matches
    // para que la empresa pueda verlo en su panel de candidatos.
    if (session.job_id) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from("job_matches")
        .update({
          simulation_score:        result.evaluation.score,
          simulation_passed:       result.evaluation.passed,
          simulation_quality:      result.evaluation.quality_level,
          simulation_feedback:     result.evaluation.feedback,
          simulation_strengths:    result.evaluation.strengths,
          simulation_improvements: result.evaluation.improvements,
          simulation_completed_at: new Date().toISOString(),
        })
        .eq("job_id", session.job_id)
        .eq("candidate_id", user.id)
    }

    return NextResponse.json({
      evaluation: result.evaluation,
      message: result.message,
      session: result.session,
    })
  } catch (error) {
    console.error("work-simulator evaluate:", error)
    const detail = error instanceof Error ? error.message : "No se pudo evaluar"
    return NextResponse.json({ detail }, { status: 400 })
  }
}
