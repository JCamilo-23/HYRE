export type ExternalSocialProvider = "google" | "apple" | "linkedin"

export const EXTERNAL_AUTH_URLS: Record<ExternalSocialProvider, string> = {
  google: "https://workspace.google.com/intl/es-419/gmail/",
  apple: "https://account.apple.com/sign-in",
  linkedin: "https://www.linkedin.com/login/es/",
}

export const EXTERNAL_AUTH_PENDING_KEY = "hyre_external_auth_pending"
export const HYRE_USER_SESSION_KEY = "hyre_user_session"

export interface ExternalAuthPending {
  provider: ExternalSocialProvider
  userType: "candidate" | "company" | null
  returnPath: string
  startedAt: number
}

export interface HyreUserSession {
  name: string
  email: string
  userType: "candidate" | "company" | null
  provider: ExternalSocialProvider
}

const PROVIDER_LABELS: Record<ExternalSocialProvider, string> = {
  google: "Google",
  apple: "Apple",
  linkedin: "LinkedIn",
}

const PROVIDER_EMAIL_DOMAINS: Record<ExternalSocialProvider, string> = {
  google: "google.com",
  apple: "apple.com",
  linkedin: "linkedin.com",
}

export function getReturnUrl(origin?: string): string {
  const base =
    origin ??
    (typeof window !== "undefined"
      ? window.location.origin
      : (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"))
  return `${base}/auth/return`
}

export function buildProviderLoginUrl(
  provider: ExternalSocialProvider,
  returnUrl: string,
): string {
  const base = EXTERNAL_AUTH_URLS[provider]

  if (provider === "linkedin") {
    const url = new URL(base)
    url.searchParams.set("session_redirect", returnUrl)
    return url.toString()
  }

  return base
}

export function getProviderLabel(provider: ExternalSocialProvider): string {
  return PROVIDER_LABELS[provider]
}

export function buildUserSessionFromPending(
  pending: ExternalAuthPending,
): HyreUserSession {
  const label = PROVIDER_LABELS[pending.provider]
  const domain = PROVIDER_EMAIL_DOMAINS[pending.provider]

  return {
    name: `Usuario de ${label}`,
    email: `usuario@${domain}`,
    userType: pending.userType,
    provider: pending.provider,
  }
}

export function readExternalAuthPending(): ExternalAuthPending | null {
  if (typeof window === "undefined") return null

  try {
    const raw = sessionStorage.getItem(EXTERNAL_AUTH_PENDING_KEY)
    if (!raw) return null
    return JSON.parse(raw) as ExternalAuthPending
  } catch {
    return null
  }
}

export function clearExternalAuthPending(): void {
  if (typeof window === "undefined") return
  sessionStorage.removeItem(EXTERNAL_AUTH_PENDING_KEY)
}

export function saveHyreUserSession(session: HyreUserSession): void {
  if (typeof window === "undefined") return
  localStorage.setItem(HYRE_USER_SESSION_KEY, JSON.stringify(session))
}

export function readHyreUserSession(): HyreUserSession | null {
  if (typeof window === "undefined") return null

  try {
    const raw = localStorage.getItem(HYRE_USER_SESSION_KEY)
    if (!raw) return null
    return JSON.parse(raw) as HyreUserSession
  } catch {
    return null
  }
}

export function completeExternalAuth(pending: ExternalAuthPending): HyreUserSession {
  const session = buildUserSessionFromPending(pending)
  saveHyreUserSession(session)
  clearExternalAuthPending()
  return session
}

export function startExternalSocialLogin({
  provider,
  userType,
  returnPath = "/app",
}: {
  provider: ExternalSocialProvider
  userType: "candidate" | "company" | null
  returnPath?: string
}): void {
  const origin = window.location.origin
  const returnUrl = getReturnUrl(origin)

  const pending: ExternalAuthPending = {
    provider,
    userType,
    returnPath,
    startedAt: Date.now(),
  }

  sessionStorage.setItem(EXTERNAL_AUTH_PENDING_KEY, JSON.stringify(pending))
  window.location.assign(buildProviderLoginUrl(provider, returnUrl))
}
