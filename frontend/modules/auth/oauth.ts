"use client"

import { createClient } from "@/lib/supabase/client"
import { assertSupabaseConfigured } from "@/lib/supabase/config-status"
import { getSafeAppOrigin } from "@/lib/supabase/app-origin"
import { OAUTH_PROVIDER_META } from "@/lib/supabase/auth-providers"
import type { UserRole } from "./types"
import { getAuthCallbackUrl, type OAuthProvider } from "./utils"

async function assertOAuthProviderEnabled(provider: OAuthProvider): Promise<void> {
  const res = await fetch("/api/auth/providers")
  if (!res.ok) {
    throw new Error("No se pudo verificar proveedores de autenticacion")
  }

  const data = (await res.json()) as { enabledOAuth?: OAuthProvider[] }
  const enabled = data.enabledOAuth ?? []

  if (!enabled.includes(provider)) {
    const label = OAUTH_PROVIDER_META[provider].label
    throw new Error(
      `${label} no esta habilitado en Supabase. Usa correo electronico o activa el proveedor en Authentication → Providers.`,
    )
  }
}

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
  await assertOAuthProviderEnabled(provider)

  const supabase = createClient()
  const redirectTo = getAuthCallbackUrl(role, next, getSafeAppOrigin())

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo,
      queryParams:
        provider === "google" ? { access_type: "offline", prompt: "consent" } : undefined,
      scopes: provider === "apple" ? "name email" : undefined,
      skipBrowserRedirect: true,
    },
  })

  if (error) throw new Error(error.message)
  if (!data.url) throw new Error("Supabase no devolvio URL de autorizacion")

  window.location.assign(data.url)
}
