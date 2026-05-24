import { NextRequest, NextResponse } from "next/server"
import { processMessage } from "@/modules/work-simulator/service"
import { getSession, saveSession } from "@/lib/work-simulator-session-store"
import { createClient } from "@/lib/supabase/server"

type Params = { params: Promise<{ id: string }> }

export async function POST(request: NextRequest, { params }: Params) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ detail: "No autorizado" }, { status: 401 })
  }

  const { id } = await params
  const session = await getSession(id, supabase)

  if (!session) {
    return NextResponse.json({ detail: "Sesión no encontrada" }, { status: 404 })
  }

  const body = await request.json()
  const message = body.message?.trim()
  if (!message) {
    return NextResponse.json({ detail: "Mensaje vacío" }, { status: 400 })
  }

  try {
    const { reply, messages, session: updated } = await processMessage(session, message)
    await saveSession(updated, supabase)
    return NextResponse.json({ session_id: id, reply, messages, session: updated })
  } catch (error) {
    console.error("work-simulator message:", error)
    return NextResponse.json({ detail: "Error al procesar mensaje" }, { status: 502 })
  }
}
