"use client"

import { ExternalLink, Settings } from "lucide-react"
import { getSupabaseConfigStatus } from "@/lib/supabase/config-status"

export function SupabaseConfigBanner() {
  const status = getSupabaseConfigStatus()
  if (status.configured) return null

  const hostname = status.url
    ? (() => {
        try {
          return new URL(status.url).hostname
        } catch {
          return status.url
        }
      })()
    : null

  return (
    <div className="mb-4 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3">
      <div className="flex items-start gap-3">
        <Settings className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
        <div className="space-y-2 text-sm">
          <p className="font-medium text-amber-200">Supabase no configurado — login bloqueado</p>
          {hostname && (
            <p className="text-xs text-amber-200/80">
              Proyecto: <code className="rounded bg-[#1E293B] px-1">{hostname}</code>
              {status.urlValid && !status.keyValid && " — URL OK, falta anon key"}
            </p>
          )}
          <p className="text-[#94A3B8] leading-relaxed">{status.message}</p>
          <ol className="list-decimal space-y-1 pl-4 text-xs text-[#94A3B8]">
            {status.dashboardApiUrl ? (
              <li>
                Copia la <strong>anon public</strong> key desde{" "}
                <a
                  href={status.dashboardApiUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#C4B5FD] hover:underline"
                >
                  Settings → API
                </a>
              </li>
            ) : (
              <li>
                Crea proyecto en{" "}
                <a
                  href="https://supabase.com/dashboard"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#C4B5FD] hover:underline"
                >
                  supabase.com/dashboard
                </a>
              </li>
            )}
            <li>
              Pega en{" "}
              <code className="rounded bg-[#1E293B] px-1 py-0.5 text-[#E2E8F0]">
                frontend/.env.local
              </code>{" "}
              como NEXT_PUBLIC_SUPABASE_ANON_KEY
            </li>
            <li>
              Abre la app en <strong className="text-amber-200">http://localhost:3000</strong>
            </li>
            <li>Verifica: npm run supabase:check</li>
          </ol>
          {status.dashboardApiUrl && (
            <a
              href={status.dashboardApiUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-[#C4B5FD] hover:text-[#E9D5FF]"
            >
              Abrir API keys del proyecto
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
