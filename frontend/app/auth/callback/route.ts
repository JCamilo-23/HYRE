import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import type { UserRole } from "@/modules/auth/types"
import type { Database } from "@/types/database"

type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"]
type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"]

function parseRole(value: string | null): UserRole | null {
  if (value === "candidate" || value === "recruiter") return value
  return null
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get("code")
  const role = parseRole(url.searchParams.get("role"))
  const next = url.searchParams.get("next") ?? "/app"
  const origin = url.origin

  if (!code) {
    return NextResponse.redirect(`${origin}/app?auth=error&reason=missing_code`)
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    return NextResponse.redirect(
      `${origin}/app?auth=error&reason=${encodeURIComponent(error.message)}`,
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
      const insertPayload: ProfileInsert = {
        id: user.id,
        email: user.email ?? "",
        full_name: fullName,
        avatar_url: avatarUrl,
        role: role ?? "candidate",
      }
      await profiles.insert(insertPayload)
    }
  }

  return NextResponse.redirect(`${origin}${next}?auth=success`)
}
