"use client"

import { ExternalLink, ShieldAlert } from "lucide-react"
import type { AuthProvidersState } from "@/hooks/use-auth-providers"

interface OAuthSetupBannerProps {
  providers: AuthProvidersState
}

export function OAuthSetupBanner({ providers }: OAuthSetupBannerProps) {
  if (providers.loading || providers.enabledOAuth.length > 0) return null
  if (!providers.configured) return null

  const dashboardProviders = providers.dashboard?.providers

  return (
    <div className="mb-4 rounded-xl border border-sky-500/30 bg-sky-500/10 px-4 py-3">
      <div className="flex items-start gap-3">
        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-sky-300" />
        <div className="space-y-2 text-sm">
          <p className="font-medium text-sky-100">
            Google, Apple y LinkedIn aun no estan activos
          </p>
          <p className="text-xs leading-relaxed text-[#94A3B8]">
            {providers.email
              ? "Puedes registrarte con correo electronico abajo. Para login social, habilita al menos un proveedor en Supabase."
              : "Habilita Email o un proveedor OAuth en Supabase para permitir el acceso."}
          </p>
          {providers.mailerAutoconfirm && providers.email && (
            <p className="text-xs text-amber-200/90">
              Confirmacion de email activa: revisa tu bandeja tras registrarte, o desactivala en
              Providers → Email para pruebas rapidas.
            </p>
          )}
          <ol className="list-decimal space-y-1 pl-4 text-xs text-[#94A3B8]">
            <li>
              Supabase → Authentication →{" "}
              {dashboardProviders ? (
                <a
                  href={dashboardProviders}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#C4B5FD] hover:underline"
                >
                  Providers
                </a>
              ) : (
                "Providers"
              )}{" "}
              → activa Google (o Apple / LinkedIn OIDC)
            </li>
            <li>
              Pega Client ID y Secret del proveedor (Google Cloud Console, etc.)
            </li>
            <li>
              Redirect URI del proveedor:{" "}
              <code className="rounded bg-[#1E293B] px-1 text-[11px]">
                https://nnbpaxomgxlbcgirmfor.supabase.co/auth/v1/callback
              </code>
            </li>
            <li>
              En{" "}
              {providers.dashboard?.urlConfiguration ? (
                <a
                  href={providers.dashboard.urlConfiguration}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#C4B5FD] hover:underline"
                >
                  URL Configuration
                </a>
              ) : (
                "URL Configuration"
              )}
              : Site URL <code className="rounded bg-[#1E293B] px-1">http://localhost:3000</code>{" "}
              y Redirect{" "}
              <code className="rounded bg-[#1E293B] px-1">http://localhost:3000/auth/callback</code>
            </li>
          </ol>
          {dashboardProviders && (
            <a
              href={dashboardProviders}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-[#C4B5FD] hover:text-[#E9D5FF]"
            >
              Abrir proveedores en Supabase
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
