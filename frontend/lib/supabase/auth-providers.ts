import type { OAuthProvider } from "@/modules/auth/utils"

export const OAUTH_PROVIDER_META: Record<
  OAuthProvider,
  { label: string; dashboardSlug: string }
> = {
  google: { label: "Google", dashboardSlug: "google" },
  apple: { label: "Apple", dashboardSlug: "apple" },
  linkedin_oidc: { label: "LinkedIn (OIDC)", dashboardSlug: "linkedin_oidc" },
}

export interface AuthProviderSettings {
  email: boolean
  oauth: Record<OAuthProvider, boolean>
  mailerAutoconfirm: boolean
  disableSignup: boolean
}

interface SupabaseAuthSettingsResponse {
  external?: Record<string, boolean>
  mailer_autoconfirm?: boolean
  disable_signup?: boolean
}

export async function fetchAuthProviderSettings(
  supabaseUrl: string,
  apiKey: string,
): Promise<AuthProviderSettings> {
  const res = await fetch(`${supabaseUrl}/auth/v1/settings`, {
    headers: { apikey: apiKey },
    next: { revalidate: 60 },
  })

  if (!res.ok) {
    throw new Error(`No se pudieron leer los proveedores de auth (HTTP ${res.status})`)
  }

  const data = (await res.json()) as SupabaseAuthSettingsResponse
  const external = data.external ?? {}

  return {
    email: external.email === true,
    oauth: {
      google: external.google === true,
      apple: external.apple === true,
      linkedin_oidc: external.linkedin_oidc === true,
    },
    mailerAutoconfirm: data.mailer_autoconfirm === true,
    disableSignup: data.disable_signup === true,
  }
}

export function getEnabledOAuthProviders(settings: AuthProviderSettings): OAuthProvider[] {
  return (Object.keys(OAUTH_PROVIDER_META) as OAuthProvider[]).filter(
    (id) => settings.oauth[id],
  )
}

export function isOAuthProviderEnabled(
  provider: OAuthProvider,
  settings: AuthProviderSettings,
): boolean {
  return settings.oauth[provider] === true
}

export function getOAuthProviderDashboardUrl(
  projectRef: string,
  provider: OAuthProvider,
): string {
  const slug = OAUTH_PROVIDER_META[provider].dashboardSlug
  return `https://supabase.com/dashboard/project/${projectRef}/auth/providers?provider=${slug}`
}

export function getAuthProvidersDashboardUrl(projectRef: string): string {
  return `https://supabase.com/dashboard/project/${projectRef}/auth/providers`
}

export function getAuthUrlConfigDashboardUrl(projectRef: string): string {
  return `https://supabase.com/dashboard/project/${projectRef}/auth/url-configuration`
}
