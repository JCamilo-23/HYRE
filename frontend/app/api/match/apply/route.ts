import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ detail: "No autorizado" }, { status: 401 })

  const { job_id, match_score }: { job_id: string; match_score: number } = await request.json()
  if (!job_id) return NextResponse.json({ detail: "job_id requerido" }, { status: 400 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("job_matches")
    .upsert({
      candidate_id: user.id,
      job_id,
      match_score,
      status: "pending",
    }, { onConflict: "candidate_id,job_id" })

  if (error) return NextResponse.json({ detail: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
