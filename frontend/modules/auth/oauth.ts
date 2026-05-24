"use client"

import { createClient } from "@/lib/supabase/client"
import { assertSupabaseConfigured } from "@/lib/supabase/config-status"
import type { UserRole } from "./types"
import { getAuthCallbackUrl, type OAuthProvider } from "./utils"

export async function signInWithOAuthProvider({
  provider,
  role,
  next = "/app",
}: {
  provider: OAuthProvider
  role: UserRole
  next?: string
}) {
  assertSupabaseConfigured()

  const supabase = createClient()
  const redirectTo = getAuthCallbackUrl(role, next, window.location.origin)

  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo,
      queryParams:
        provider === "google" ? { access_type: "offline", prompt: "consent" } : undefined,
      scopes: provider === "apple" ? "name email" : undefined,
    },
  })

  if (error) throw new Error(error.message)
}
