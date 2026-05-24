import { NextRequest, NextResponse } from "next/server"
import { createSessionData } from "@/modules/work-simulator/service"
import { memSave } from "@/lib/work-simulator-memory-store"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const session = createSessionData({
      user_id: "guest",
      role_title: body.role_title,
      company_name: body.company_name,
      job_id: body.job_id ?? undefined,
      industry: body.industry,
      job_description: body.job_description,
      culture: body.culture,
      benefits: body.benefits,
    })
    memSave(session)
    return NextResponse.json(session, { status: 201 })
  } catch (error) {
    console.error("work-simulator create session:", error)
    return NextResponse.json({ detail: "No se pudo crear la sesión" }, { status: 500 })
  }
}
