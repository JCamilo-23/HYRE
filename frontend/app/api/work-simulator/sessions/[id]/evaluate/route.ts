import { NextRequest, NextResponse } from "next/server"
import { processEvaluation } from "@/modules/work-simulator/service"
import { getSession, saveSession } from "@/lib/work-simulator-session-store"

type Params = { params: Promise<{ id: string }> }

export async function POST(request: NextRequest, { params }: Params) {
  const { id } = await params
  const session = getSession(id)

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
    saveSession(result.session)
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
