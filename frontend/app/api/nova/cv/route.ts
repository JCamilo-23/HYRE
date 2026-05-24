import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 })

    const { data: cvs, error } = await (supabase as any)
      .from("nova_cvs")
      .select(`
        *,
        latest_analysis:nova_analyses(
          id, score_general, score_ats, score_technical,
          score_recruiter, score_visual, score_communication,
          feedback_summary, top_actions, created_at, model_used
        )
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1, { foreignTable: "nova_analyses" })

    if (error) throw new Error(error.message)

    return NextResponse.json({ cvs: cvs ?? [] })
  } catch (err: any) {
    console.error("[nova/cv GET]", err)
    return NextResponse.json({ error: err.message ?? "Error interno" }, { status: 500 })
  }
}
