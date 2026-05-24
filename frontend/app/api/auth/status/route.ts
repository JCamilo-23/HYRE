import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getSupabaseConfigStatus } from "@/lib/supabase/config-status"
import {
  fetchAuthProviderSettings,
  getEnabledOAuthProviders,
} from "@/lib/supabase/auth-providers"

export async function GET() {
  const status = getSupabaseConfigStatus()
  let reachable = false
  let authHealth: string | null = null
  let providers: Awaited<ReturnType<typeof fetchAuthProviderSettings>> | null = null
  let enabledOAuth: string[] = []

  if (status.configured && status.url && status.keyValid) {
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
    try {
      if (anonKey) {
        providers = await fetchAuthProviderSettings(status.url, anonKey)
        enabledOAuth = getEnabledOAuthProviders(providers)
        reachable = true
        authHealth = "ok"
      }
    } catch (e) {
      authHealth = e instanceof Error ? e.message : "unreachable"
    }
  }

  return NextResponse.json({
    ...status,
    urlHost: status.url ? new URL(status.url).hostname : null,
    reachable,
    authHealth,
    emailEnabled: providers?.email ?? false,
    enabledOAuth,
    mailerAutoconfirm: providers?.mailerAutoconfirm ?? null,
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
