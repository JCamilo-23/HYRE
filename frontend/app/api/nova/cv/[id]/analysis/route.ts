import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 })

    const { data: analysis, error } = await (supabase as any)
      .from("nova_analyses")
      .select("*")
      .eq("cv_id", params.id)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    if (error) return NextResponse.json({ error: "Análisis no encontrado" }, { status: 404 })

    return NextResponse.json({ analysis })
  } catch (err: any) {
    console.error("[nova/cv/analysis GET]", err)
    return NextResponse.json({ error: err.message ?? "Error interno" }, { status: 500 })
  }
}
