import { NextRequest, NextResponse } from "next/server"
import { createInterviewSessionData } from "@/modules/work-simulator/service"
import { saveSession } from "@/lib/work-simulator-session-store"

/** Crea sesión de entrevista reutilizando el store del simulador laboral */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const session = createInterviewSessionData({
      job_id: body.job_id,
      role_title: body.role_title ?? "Profesional",
      company_name: body.company_name ?? "Empresa",
      industry: body.industry,
      job_description: body.job_description,
      culture: body.culture,
      benefits: body.benefits,
      max_questions: body.max_questions,
    })
    saveSession(session)
    return NextResponse.json(session)
  } catch (error) {
    console.error("interview session create:", error)
    return NextResponse.json({ detail: "No se pudo crear la sesión" }, { status: 500 })
  }
}
