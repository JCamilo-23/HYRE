import { NextRequest, NextResponse } from "next/server"
import { processEvaluation } from "@/modules/work-simulator/service"
import { getSession, saveSession } from "@/lib/work-simulator-session-store"
import { createClient } from "@/lib/supabase/server"
import { sendPushNotification } from "@/lib/web-push"

type Params = { params: Promise<{ id: string }> }
type SupabaseClient = Awaited<ReturnType<typeof createClient>>

async function notifyCompanySimulationDone(
  supabase: SupabaseClient,
  jobId: string,
  roleTitle: string,
  score: number,
): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: job } = await (supabase as any)
    .from("jobs")
    .select("company_id")
    .eq("id", jobId)
    .single()
  if (!job?.company_id) return

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: subs } = await (supabase as any)
    .from("push_subscriptions")
    .select("endpoint, p256dh, auth")
    .eq("user_id", job.company_id)
  if (!subs?.length) return

  const payload = {
    title: "Simulación completada",
    body: `Un candidato completó la simulación para ${roleTitle} — Puntuación: ${score}/100`,
    url: "/app",
  }
  await Promise.allSettled(
    subs.map((sub: { endpoint: string; p256dh: string; auth: string }) =>
      sendPushNotification(sub, payload)
    )
  )
}

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

      // Notificar a la empresa que el candidato completó la simulación
      notifyCompanySimulationDone(supabase, session.job_id, session.role_title, result.evaluation.score).catch(
        (e) => console.error("push notify company:", e)
      )
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
