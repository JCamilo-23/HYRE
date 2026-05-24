import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { sendPushNotification, type PushPayload } from "@/lib/web-push"

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ detail: "No autorizado" }, { status: 401 })
  }

  const body = await request.json()
  const { user_id, payload }: { user_id: string; payload: PushPayload } = body

  if (!user_id || !payload?.title) {
    return NextResponse.json({ detail: "Parámetros inválidos" }, { status: 400 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: subscriptions } = await (supabase as any)
    .from("push_subscriptions")
    .select("endpoint, p256dh, auth")
    .eq("user_id", user_id)

  if (!subscriptions?.length) {
    return NextResponse.json({ sent: 0 })
  }

  const results = await Promise.allSettled(
    subscriptions.map((sub: { endpoint: string; p256dh: string; auth: string }) =>
      sendPushNotification(sub, payload)
    )
  )

  const sent = results.filter((r) => r.status === "fulfilled").length
  return NextResponse.json({ sent, total: subscriptions.length })
}
