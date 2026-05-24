import type { OAuthProvider } from "@/modules/auth/utils"
import type { UserRole } from "@/modules/auth/types"
import { getSafeAppOrigin } from "@/lib/supabase/app-origin"

export const EXTERNAL_SOCIAL_BASE_URLS: Record<OAuthProvider, string> = {
  google: "https://workspace.google.com/intl/es-419/gmail/",
  apple: "https://account.apple.com/sign-in",
  linkedin_oidc: "https://www.linkedin.com/login/es/",
}

/** Proveedores que abren en ventana emergente y vuelven al cerrarla (no redirigen solos a HYRE). */
export const POPUP_SOCIAL_PROVIDERS: OAuthProvider[] = ["google", "apple"]

export interface SocialPendingAuth {
  provider: OAuthProvider
  role: UserRole
  next: string
  startedAt: string
}

export interface SocialSession {
  provider: OAuthProvider
  role: UserRole
  name: string
  email: string
  loggedInAt: string
}

export const SOCIAL_PENDING_COOKIE = "hyre_social_pending"
export const SOCIAL_SESSION_COOKIE = "hyre_social_session"

const DEMO_PROFILE: Record<
  OAuthProvider,
  { name: string; email: string }
> = {
  google: { name: "Usuario Google", email: "usuario@gmail.com" },
  apple: { name: "Usuario Apple", email: "usuario@icloud.com" },
  linkedin_oidc: { name: "Usuario LinkedIn", email: "usuario@linkedin.com" },
}

export function buildSocialReturnUrl(
  provider: OAuthProvider,
  origin?: string,
): string {
  const base = getSafeAppOrigin(origin)
  return `${base}/auth/return?provider=${provider}`
}

export function buildExternalSocialLoginUrl(
  provider: OAuthProvider,
  returnUrl: string,
): string {
  const base = EXTERNAL_SOCIAL_BASE_URLS[provider]

  if (provider === "linkedin_oidc") {
    const url = new URL(base)
    url.searchParams.set("session_redirect", returnUrl)
    return url.toString()
  }

  if (provider === "apple") {
    const url = new URL(base)
    url.searchParams.set("returnUrl", returnUrl)
    return url.toString()
  }

  return base
}

export function createSocialSession(
  provider: OAuthProvider,
  role: UserRole,
): SocialSession {
  const demo = DEMO_PROFILE[provider]
  return {
    provider,
    role,
    name: demo.name,
    email: demo.email,
    loggedInAt: new Date().toISOString(),
  }
}

export function encodeSocialCookie<T>(value: T): string {
  return Buffer.from(JSON.stringify(value), "utf8").toString("base64url")
}

export function decodeSocialCookie<T>(value: string): T | null {
  try {
    return JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as T
  } catch {
    return null
  }
}

export function isOAuthProvider(value: string): value is OAuthProvider {
  return value === "google" || value === "apple" || value === "linkedin_oidc"
}
