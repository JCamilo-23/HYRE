"use client"

import { getSafeAppOrigin } from "@/lib/supabase/app-origin"
import type { UserRole } from "./types"
import type { OAuthProvider } from "./utils"

export async function signInWithOAuthProvider({
  provider,
  role,
  next = "/app",
}: {
  provider: OAuthProvider
  role: UserRole
  next?: string
}) {
  const origin = getSafeAppOrigin()
  const url = new URL(`${origin}/auth/social/${provider}`)
  url.searchParams.set("role", role)
  url.searchParams.set("next", next)
  window.location.assign(url.toString())
}
