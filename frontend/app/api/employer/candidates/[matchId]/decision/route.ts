import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { sendPushNotification } from "@/lib/web-push"

type Params = { params: Promise<{ matchId: string }> }

export async function POST(request: NextRequest, { params }: Params) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ detail: "No autorizado" }, { status: 401 })

  const { matchId } = await params
  const { status }: { status: "accepted" | "rejected" } = await request.json()

  if (status !== "accepted" && status !== "rejected") {
    return NextResponse.json({ detail: "Estado inválido" }, { status: 400 })
  }

  // Verificar que el match pertenece a una vacante de esta empresa
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: match } = await (supabase as any)
    .from("job_matches")
    .select("candidate_id, job_id, jobs!inner(company_id, title)")
    .eq("id", matchId)
    .single()

  if (!match || match.jobs.company_id !== user.id) {
    return NextResponse.json({ detail: "No encontrado" }, { status: 404 })
  }

  // Actualizar el estado en job_matches
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("job_matches")
    .update({ status })
    .eq("id", matchId)

  if (error) return NextResponse.json({ detail: error.message }, { status: 500 })

  // Enviar push notification al candidato
  notifyCandidate(supabase, match.candidate_id, status, match.jobs.title).catch(
    (e) => console.error("push notify candidate:", e)
  )

  return NextResponse.json({ ok: true })
}

async function notifyCandidate(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  candidateId: string,
  status: "accepted" | "rejected",
  jobTitle: string,
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: subs } = await (supabase as any)
    .from("push_subscriptions")
    .select("endpoint, p256dh, auth")
    .eq("user_id", candidateId)

  if (!subs?.length) return

  const payload =
    status === "accepted"
      ? {
          title: "¡Felicitaciones! Te aceptaron",
          body: `Una empresa te aceptó para la vacante: ${jobTitle}`,
          url: "/app",
        }
      : {
          title: "Actualización de tu aplicación",
          body: `No avanzaste en el proceso para ${jobTitle}. ¡Sigue intentando!`,
          url: "/app",
        }

  await Promise.allSettled(
    subs.map((sub: { endpoint: string; p256dh: string; auth: string }) =>
      sendPushNotification(sub, payload)
    )
  )
}
