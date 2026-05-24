const PLACEHOLDER_HOSTS = ["placeholder.supabase.co", "your-project.supabase.co"]
const PLACEHOLDER_KEY_MARKERS = ["placeholder", "your-anon-key", "paste_anon"]

export interface SupabaseConfigStatus {
  configured: boolean
  url: string | null
  urlValid: boolean
  keyValid: boolean
  projectRef: string | null
  reason: "missing" | "placeholder_url" | "placeholder_key" | "invalid_url" | null
  message: string | null
  dashboardApiUrl: string | null
}

function extractProjectRef(url: string): string | null {
  try {
    const host = new URL(url).hostname
    const match = host.match(/^([a-z0-9]+)\.supabase\.co$/)
    return match?.[1] ?? null
  } catch {
    return null
  }
}

export function getSupabaseConfigStatus(): SupabaseConfigStatus {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || null
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || null

  if (!url || !anonKey) {
    return {
      configured: false,
      url,
      urlValid: false,
      keyValid: false,
      projectRef: url ? extractProjectRef(url) : null,
      reason: "missing",
      message:
        "Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY en frontend/.env.local",
      dashboardApiUrl: null,
    }
  }

  let hostname = ""
  try {
    hostname = new URL(url).hostname
  } catch {
    return {
      configured: false,
      url,
      urlValid: false,
      keyValid: false,
      projectRef: null,
      reason: "invalid_url",
      message: "NEXT_PUBLIC_SUPABASE_URL no es una URL valida.",
      dashboardApiUrl: null,
    }
  }

  const projectRef = extractProjectRef(url)
  const dashboardApiUrl = projectRef
    ? `https://supabase.com/dashboard/project/${projectRef}/settings/api`
    : null

  const isPlaceholderHost = PLACEHOLDER_HOSTS.includes(hostname)
  const isPlaceholderKey = PLACEHOLDER_KEY_MARKERS.some((m) =>
    anonKey.toLowerCase().includes(m),
  )

  if (isPlaceholderHost) {
    return {
      configured: false,
      url,
      urlValid: false,
      keyValid: !isPlaceholderKey,
      projectRef,
      reason: "placeholder_url",
      message:
        "NEXT_PUBLIC_SUPABASE_URL usa placeholder. Usa https://TU-REF.supabase.co (ej: nnbpaxomgxlbcgirmfor).",
      dashboardApiUrl,
    }
  }

  if (isPlaceholderKey) {
    return {
      configured: false,
      url,
      urlValid: true,
      keyValid: false,
      projectRef,
      reason: "placeholder_key",
      message: projectRef
        ? `URL del proyecto OK (${projectRef}). Falta la anon key: Supabase Dashboard → Settings → API → anon public.`
        : "Falta la anon public key en NEXT_PUBLIC_SUPABASE_ANON_KEY.",
      dashboardApiUrl,
    }
  }

  return {
    configured: true,
    url,
    urlValid: true,
    keyValid: true,
    projectRef,
    reason: null,
    message: null,
    dashboardApiUrl,
  }
}

export function isSupabaseConfigured(): boolean {
  return getSupabaseConfigStatus().configured
}

export function assertSupabaseConfigured(): void {
  const status = getSupabaseConfigStatus()
  if (!status.configured) {
    throw new Error(status.message ?? "Supabase no esta configurado.")
  }
}
