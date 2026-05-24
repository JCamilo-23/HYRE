import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getSafeAppOrigin } from "@/lib/supabase/app-origin"
import type { UserRole } from "@/modules/auth/types"
import type { Database } from "@/types/database"

type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"]
type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"]

function parseRole(value: string | null): UserRole | null {
  return value === "candidate" || value === "recruiter" ? value : null
}

function redirectToApp(path: string, requestUrl: URL) {
  const origin = getSafeAppOrigin(requestUrl.origin)
  return NextResponse.redirect(`${origin}${path}`)
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get("code")
  const role = parseRole(url.searchParams.get("role"))
  const next = url.searchParams.get("next") ?? "/app"

  const oauthError = url.searchParams.get("error")
  const oauthErrorDescription = url.searchParams.get("error_description")
  if (oauthError) {
    const reason = oauthErrorDescription ?? oauthError
    return redirectToApp(
      `/app?auth=error&reason=${encodeURIComponent(reason)}`,
      url,
    )
  }

  if (!code) {
    return redirectToApp(
      "/app?auth=error&reason=" +
        encodeURIComponent(
          "No se recibió código OAuth. Usa http://localhost:3000 (no 0.0.0.0) y verifica Redirect URLs en Supabase.",
        ),
      url,
    )
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    return redirectToApp(
      `/app?auth=error&reason=${encodeURIComponent(error.message)}`,
      url,
    )
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    const metadata = user.user_metadata ?? {}
    const fullName =
      (typeof metadata.full_name === "string" && metadata.full_name) ||
      (typeof metadata.name === "string" && metadata.name) ||
      null
    const avatarUrl =
      typeof metadata.avatar_url === "string" ? metadata.avatar_url : null

    const profileUpdate: ProfileUpdate = {
      full_name: fullName,
      avatar_url: avatarUrl,
      updated_at: new Date().toISOString(),
    }
    if (role) profileUpdate.role = role

    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .maybeSingle()

    const profiles = supabase.from("profiles") as unknown as {
      update: (values: ProfileUpdate) => {
        eq: (column: string, value: string) => Promise<{ error: Error | null }>
      }
      insert: (values: ProfileInsert) => Promise<{ error: Error | null }>
    }

    if (existing) {
      await profiles.update(profileUpdate).eq("id", user.id)
    } else {
      await profiles.insert({
        id: user.id,
        email: user.email ?? "",
        full_name: fullName,
        avatar_url: avatarUrl,
        role: role ?? "candidate",
      })
    }
  }

  const nextPath = next.startsWith("/") ? next : "/app"
  return redirectToApp(`${nextPath}?auth=success`, url)
}
