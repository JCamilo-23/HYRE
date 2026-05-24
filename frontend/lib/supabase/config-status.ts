const PLACEHOLDER_HOSTS = ["placeholder.supabase.co", "your-project.supabase.co"]
const PLACEHOLDER_KEY_MARKERS = ["placeholder", "your-anon-key"]

export interface SupabaseConfigStatus {
  configured: boolean
  url: string | null
  reason: "missing" | "placeholder" | "invalid_url" | null
  message: string | null
}

export function getSupabaseConfigStatus(): SupabaseConfigStatus {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || null
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || null

  if (!url || !anonKey) {
    return {
      configured: false,
      url,
      reason: "missing",
      message:
        "Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY en frontend/.env.local",
    }
  }

  let hostname = ""
  try {
    hostname = new URL(url).hostname
  } catch {
    return {
      configured: false,
      url,
      reason: "invalid_url",
      message: "NEXT_PUBLIC_SUPABASE_URL no es una URL valida.",
    }
  }

  if (
    PLACEHOLDER_HOSTS.includes(hostname) ||
    PLACEHOLDER_KEY_MARKERS.some((m) => anonKey.toLowerCase().includes(m))
  ) {
    return {
      configured: false,
      url,
      reason: "placeholder",
      message:
        "Supabase esta en modo demo (placeholder.supabase.co). Crea un proyecto en supabase.com, actualiza frontend/.env.local con URL y anon key reales, y reinicia npm run dev.",
    }
  }

  return { configured: true, url, reason: null, message: null }
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
