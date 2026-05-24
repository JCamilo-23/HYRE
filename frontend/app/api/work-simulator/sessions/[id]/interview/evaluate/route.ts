import { NextRequest, NextResponse } from "next/server"
import { processInterviewAnswer } from "@/modules/work-simulator/service"
import { getSession, saveSession } from "@/lib/work-simulator-session-store"

type Params = { params: Promise<{ id: string }> }

export async function POST(request: NextRequest, { params }: Params) {
  const { id } = await params
  const session = getSession(id)

  if (!session) {
    return NextResponse.json({ detail: "Sesión no encontrada" }, { status: 404 })
  }

  let body: { transcript?: string } = {}
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ detail: "Cuerpo inválido" }, { status: 400 })
  }

  const transcript = body.transcript?.trim()
  if (!transcript) {
    return NextResponse.json({ detail: "transcript es requerido" }, { status: 400 })
  }

  try {
    const result = await processInterviewAnswer(session, transcript)
    saveSession(result.session)
    return NextResponse.json({
      evaluation: result.evaluation,
      scores: result.scores,
      session: result.session,
    })
  } catch (error) {
    const detail = error instanceof Error ? error.message : "No se pudo evaluar la respuesta"
    console.error("interview evaluate:", error)
    return NextResponse.json({ detail }, { status: error instanceof Error ? 400 : 502 })
  }
}
