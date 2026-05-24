"use client"

import { useEffect, useState } from "react"
import type { OAuthProvider } from "@/modules/auth/utils"

export interface AuthProvidersState {
  loading: boolean
  configured: boolean
  email: boolean
  enabledOAuth: OAuthProvider[]
  mailerAutoconfirm: boolean
  dashboard: {
    providers: string
    urlConfiguration: string
    projectRef: string
  } | null
  error: string | null
}

const INITIAL: AuthProvidersState = {
  loading: true,
  configured: false,
  email: false,
  enabledOAuth: [],
  mailerAutoconfirm: false,
  dashboard: null,
  error: null,
}

export function useAuthProviders(): AuthProvidersState {
  const [state, setState] = useState<AuthProvidersState>(INITIAL)

  useEffect(() => {
    let cancelled = false

    void (async () => {
      try {
        const res = await fetch("/api/auth/providers")
        const data = (await res.json()) as {
          configured?: boolean
          email?: boolean
          enabledOAuth?: OAuthProvider[]
          mailerAutoconfirm?: boolean
          dashboard?: AuthProvidersState["dashboard"]
          error?: string
        }

        if (cancelled) return

        setState({
          loading: false,
          configured: data.configured === true,
          email: data.email === true,
          enabledOAuth: data.enabledOAuth ?? [],
          mailerAutoconfirm: data.mailerAutoconfirm === true,
          dashboard: data.dashboard ?? null,
          error: data.error ?? null,
        })
      } catch (e) {
        if (cancelled) return
        setState({
          ...INITIAL,
          loading: false,
          error: e instanceof Error ? e.message : "Error al cargar proveedores",
        })
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  return state
}
