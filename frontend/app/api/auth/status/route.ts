import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getSupabaseConfigStatus } from "@/lib/supabase/config-status"

export async function GET() {
  const status = getSupabaseConfigStatus()
  let reachable = false
  let authHealth: string | null = null

  if (status.configured && status.url && status.keyValid) {
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
    try {
      const res = await fetch(`${status.url}/auth/v1/settings`, {
        headers: anonKey ? { apikey: anonKey } : undefined,
        next: { revalidate: 0 },
      })
      reachable = res.ok
      authHealth = res.ok ? "ok" : `HTTP ${res.status}`
    } catch (e) {
      authHealth = e instanceof Error ? e.message : "unreachable"
    }
  }

  return NextResponse.json({
    ...status,
    urlHost: status.url ? new URL(status.url).hostname : null,
    reachable,
    authHealth,
  })
}

export async function POST() {
  const status = getSupabaseConfigStatus()
  if (!status.configured) {
    return NextResponse.json({ ok: false, error: status.message }, { status: 400 })
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.getSession()

  return NextResponse.json({
    ok: !error,
    hasSession: !!data.session,
    error: error?.message ?? null,
  })
}
