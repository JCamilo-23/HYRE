const PLACEHOLDER_HOSTS = ["placeholder.supabase.co", "your-project.supabase.co"]
const PLACEHOLDER_KEY_MARKERS = ["placeholder", "your-anon-key"]

export interface SupabaseConfigStatus {
  configured: boolean
  url: string | null
  reason: "missing" | "placeholder" | "invalid_url" | null
  message: string | null
}

function readSupabaseUrl(): string | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  return url || null
}

function readSupabaseAnonKey(): string | null {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
  return key || null
}

export function getSupabaseConfigStatus(): SupabaseConfigStatus {
  const url = readSupabaseUrl()
  const anonKey = readSupabaseAnonKey()

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

  const isPlaceholderHost = PLACEHOLDER_HOSTS.includes(hostname)
  const isPlaceholderKey = PLACEHOLDER_KEY_MARKERS.some((marker) =>
    anonKey.toLowerCase().includes(marker),
  )

  if (isPlaceholderHost || isPlaceholderKey) {
    return {
      configured: false,
      url,
      reason: "placeholder",
      message:
        "Supabase esta en modo demo (placeholder.supabase.co). Crea un proyecto en supabase.com y actualiza frontend/.env.local con la URL y anon key reales. Luego reinicia npm run dev.",
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
