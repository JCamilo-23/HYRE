"use client"

import { ExternalLink, Settings } from "lucide-react"
import { getSupabaseConfigStatus } from "@/lib/supabase/config-status"

export function SupabaseConfigBanner() {
  const status = getSupabaseConfigStatus()
  if (status.configured) return null

  return (
    <div className="mb-4 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3">
      <div className="flex items-start gap-3">
        <Settings className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
        <div className="space-y-2 text-sm">
          <p className="font-medium text-amber-200">Supabase no configurado</p>
          <p className="text-[#94A3B8] leading-relaxed">{status.message}</p>
          <ol className="list-decimal space-y-1 pl-4 text-xs text-[#94A3B8]">
            <li>Crea un proyecto en supabase.com</li>
            <li>
              Copia Project URL y anon key a{" "}
              <code className="rounded bg-[#1E293B] px-1 py-0.5 text-[#E2E8F0]">
                frontend/.env.local
              </code>
            </li>
            <li>Abre la app en <strong className="text-amber-200">http://localhost:3000</strong> (no uses 0.0.0.0)</li>
            <li>Reinicia: npm run dev</li>
            <li>Habilita Google/Apple/LinkedIn en Authentication → Providers</li>
          </ol>
          <a
            href="https://supabase.com/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-[#C4B5FD] hover:text-[#E9D5FF]"
          >
            Abrir Supabase Dashboard
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </div>
  )
}
