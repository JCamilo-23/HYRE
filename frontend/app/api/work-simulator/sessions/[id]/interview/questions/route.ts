import { NextRequest, NextResponse } from "next/server"
import { processInterviewQuestion } from "@/modules/work-simulator/service"
import { getSession, saveSession } from "@/lib/work-simulator-session-store"
import type { GenerateInterviewQuestionOptions } from "@/modules/work-simulator/types"

type Params = { params: Promise<{ id: string }> }

export async function POST(request: NextRequest, { params }: Params) {
  const { id } = await params
  const session = getSession(id)

  if (!session) {
    return NextResponse.json({ detail: "Sesión no encontrada" }, { status: 404 })
  }

  if (!session.scenario_context.interview_mode) {
    return NextResponse.json(
      { detail: "La sesión no está en modo entrevista" },
      { status: 400 },
    )
  }

  let options: GenerateInterviewQuestionOptions = {}
  try {
    options = await request.json()
  } catch {
    options = {}
  }

  try {
    const result = await processInterviewQuestion(session, options)
    saveSession(result.session)
    const maxQ =
      result.session.scenario_context.interview_max_questions ?? 6
    const current = result.session.scenario_context.interview_question_index ?? 1
    return NextResponse.json({
      question: result.question,
      progress: { current, total: maxQ },
      session: result.session,
    })
  } catch (error) {
    const detail = error instanceof Error ? error.message : "No se pudo generar la pregunta"
    const status = detail.includes("completada") ? 400 : 502
    console.error("interview question:", error)
    return NextResponse.json({ detail }, { status })
  }
}
