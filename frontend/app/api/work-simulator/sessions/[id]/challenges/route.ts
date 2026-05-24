import { NextRequest, NextResponse } from "next/server"
import { processChallenge } from "@/modules/work-simulator/service"
import { memGet, memSave } from "@/lib/work-simulator-memory-store"
import type { GenerateChallengeOptions } from "@/modules/work-simulator/types"

type Params = { params: Promise<{ id: string }> }

export async function POST(request: NextRequest, { params }: Params) {
  const { id } = await params
  const session = memGet(id)

  if (!session) {
    return NextResponse.json({ detail: "Sesión no encontrada" }, { status: 404 })
  }

  let options: GenerateChallengeOptions = {}
  try {
    options = await request.json()
  } catch {
    options = {}
  }

  try {
    const result = await processChallenge(session, options)
    memSave(result.session)
    return NextResponse.json({
      challenge: result.challenge,
      message: result.message,
      session: result.session,
    })
  } catch (error) {
    const detail = error instanceof Error ? error.message : "No se pudo generar la tarea"
    console.error("work-simulator challenge:", error)
    return NextResponse.json({ detail }, { status: error instanceof Error && detail.includes("activa") ? 400 : 502 })
  }
}
