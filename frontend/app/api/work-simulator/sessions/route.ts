import { NextRequest, NextResponse } from "next/server"
import { createSessionData } from "@/modules/work-simulator/service"
import { saveSession } from "@/lib/work-simulator-session-store"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ detail: "No autorizado" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const session = createSessionData({
      user_id: user.id,
      role_title: body.role_title,
      company_name: body.company_name,
      job_id: body.job_id ?? undefined,
      industry: body.industry,
      job_description: body.job_description,
      culture: body.culture,
      benefits: body.benefits,
    })
    await saveSession(session, supabase)
    return NextResponse.json(session, { status: 201 })
  } catch (error) {
    console.error("work-simulator create session:", error)
    return NextResponse.json({ detail: "No se pudo crear la sesión" }, { status: 500 })
  }
}
