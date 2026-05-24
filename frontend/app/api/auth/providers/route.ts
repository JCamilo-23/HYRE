import { NextResponse } from "next/server"
import {
  fetchAuthProviderSettings,
  getAuthProvidersDashboardUrl,
  getAuthUrlConfigDashboardUrl,
  getEnabledOAuthProviders,
  OAUTH_PROVIDER_META,
} from "@/lib/supabase/auth-providers"
import { getSupabaseConfigStatus } from "@/lib/supabase/config-status"

export async function GET() {
  const status = getSupabaseConfigStatus()

  if (!status.configured || !status.url || !status.projectRef) {
    return NextResponse.json(
      {
        configured: false,
        email: false,
        oauth: { google: false, apple: false, linkedin_oidc: false },
        enabledOAuth: [] as string[],
        mailerAutoconfirm: false,
        disableSignup: false,
        dashboard: null,
        message: status.message,
      },
      { status: 200 },
    )
  }

  const apiKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
  if (!apiKey) {
    return NextResponse.json({ configured: false, message: "Falta API key" }, { status: 200 })
  }

  try {
    const settings = await fetchAuthProviderSettings(status.url, apiKey)
    const enabledOAuth = getEnabledOAuthProviders(settings)

    return NextResponse.json({
      configured: true,
      email: settings.email,
      oauth: settings.oauth,
      enabledOAuth,
      mailerAutoconfirm: settings.mailerAutoconfirm,
      disableSignup: settings.disableSignup,
      providers: enabledOAuth.map((id) => ({
        id,
        label: OAUTH_PROVIDER_META[id].label,
      })),
      dashboard: {
        providers: getAuthProvidersDashboardUrl(status.projectRef),
        urlConfiguration: getAuthUrlConfigDashboardUrl(status.projectRef),
        projectRef: status.projectRef,
      },
    })
  } catch (e) {
    return NextResponse.json(
      {
        configured: true,
        error: e instanceof Error ? e.message : "Error al leer proveedores",
      },
      { status: 500 },
    )
  }
}
