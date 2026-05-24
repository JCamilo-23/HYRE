"use client"

import { useEffect, useRef, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"
import {
  buildExternalSocialLoginUrl,
  buildSocialReturnUrl,
  EXTERNAL_SOCIAL_BASE_URLS,
  isOAuthProvider,
} from "@/lib/auth/external-social"
import { getSafeAppOrigin } from "@/lib/supabase/app-origin"

export function SocialAuthWaitContent() {
  const searchParams = useSearchParams()
  const providerParam = searchParams.get("provider") ?? ""
  const role = searchParams.get("role") ?? "candidate"
  const next = searchParams.get("next") ?? "/app"
  const popupRef = useRef<Window | null>(null)
  const [blocked, setBlocked] = useState(false)
  const [done, setDone] = useState(false)

  const provider = isOAuthProvider(providerParam) ? providerParam : null

  useEffect(() => {
    if (!provider || done) return

    const origin = getSafeAppOrigin()
    const returnUrl = buildSocialReturnUrl(provider, origin)
    const loginUrl = buildExternalSocialLoginUrl(provider, returnUrl)

    const popup = window.open(loginUrl, "hyre_social_login", "width=520,height=720")
    popupRef.current = popup

    if (!popup) {
      setBlocked(true)
      return
    }

    const timer = window.setInterval(() => {
      if (popup.closed) {
        window.clearInterval(timer)
        setDone(true)
        window.location.assign(
          `${origin}/auth/return?provider=${provider}&role=${role}&next=${encodeURIComponent(next)}`,
        )
      }
    }, 400)

    return () => {
      window.clearInterval(timer)
      if (popupRef.current && !popupRef.current.closed) {
        popupRef.current.close()
      }
    }
  }, [provider, role, next, done])

  if (!provider) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0F172A] px-6 text-center text-sm text-red-300">
        Proveedor de acceso invalido.
      </div>
    )
  }

  const loginUrl = buildExternalSocialLoginUrl(
    provider,
    buildSocialReturnUrl(provider, getSafeAppOrigin()),
  )

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0F172A] px-6 text-center">
      <Loader2 className="mb-4 h-8 w-8 animate-spin text-[#7C3AED]" />
      <h1 className="mb-2 text-lg font-semibold text-[#F1F5F9]">
        Inicia sesion en {provider === "google" ? "Google" : "Apple"}
      </h1>
      <p className="mb-6 max-w-sm text-sm text-[#94A3B8]">
        Se abrio una ventana con la pagina de acceso. Cuando termines, cierra esa ventana y
        volveras automaticamente a HYRE.
      </p>

      {blocked && (
        <div className="space-y-3">
          <p className="text-xs text-amber-200">
            El navegador bloqueo la ventana emergente. Abre el login manualmente:
          </p>
          <a
            href={loginUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex rounded-xl bg-[#7C3AED] px-4 py-2 text-sm font-medium text-white hover:bg-[#6D28D9]"
          >
            Abrir {provider === "google" ? "Gmail" : "Apple ID"}
          </a>
          <button
            type="button"
            onClick={() => {
              window.location.assign(
                `${getSafeAppOrigin()}/auth/return?provider=${provider}&role=${role}&next=${encodeURIComponent(next)}`,
              )
            }}
            className="block w-full text-sm text-[#C4B5FD] hover:underline"
          >
            Ya inicie sesion — volver a HYRE
          </button>
        </div>
      )}

      <p className="mt-8 text-xs text-[#64748B]">
        Destino: {EXTERNAL_SOCIAL_BASE_URLS[provider]}
      </p>
    </div>
  )
}
