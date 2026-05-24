/**
 * Origin seguro para redirects OAuth.
 * 0.0.0.0 es válido para el servidor pero NO para el navegador (ERR_ADDRESS_INVALID).
 */
export function getSafeAppOrigin(requestOrigin?: string): string {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL?.trim()
  if (fromEnv) {
    try {
      return normalizeOrigin(new URL(fromEnv).origin)
    } catch {
      /* ignore invalid env */
    }
  }

  if (requestOrigin) {
    return normalizeOrigin(requestOrigin)
  }

  if (typeof window !== "undefined") {
    const { protocol, hostname, port } = window.location
    const host = hostname === "0.0.0.0" ? "localhost" : hostname
    const portSuffix = port ? `:${port}` : ""
    return normalizeOrigin(`${protocol}//${host}${portSuffix}`)
  }

  return "http://localhost:3000"
}

function normalizeOrigin(origin: string): string {
  return origin.replace("://0.0.0.0", "://localhost")
}

export function getAuthCallbackUrl(role: string, next = "/app", origin?: string): string {
  const base = getSafeAppOrigin(origin)
  const params = new URLSearchParams({ role, next })
  return `${base}/auth/callback?${params.toString()}`
}
