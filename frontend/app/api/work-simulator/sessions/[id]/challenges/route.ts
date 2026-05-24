import { NextResponse } from "next/server"
import { processChallenge } from "@/modules/work-simulator/service"
import { getSession, saveSession } from "@/lib/work-simulator-session-store"

type Params = { params: Promise<{ id: string }> }

export async function POST(_request: Request, { params }: Params) {
  const { id } = await params
  const session = getSession(id)

  if (!session) {
    return NextResponse.json({ detail: "Sesión no encontrada" }, { status: 404 })
  }

  try {
    const result = await processChallenge(session)
    saveSession(result.session)
    return NextResponse.json({
      challenge: result.challenge,
      message: result.message,
      session: result.session,
    })
  } catch (error) {
    console.error("work-simulator challenge:", error)
    return NextResponse.json({ detail: "No se pudo generar el reto" }, { status: 502 })
  }
}
