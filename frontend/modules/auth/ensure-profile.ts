"use client"

import { createClient } from "@/lib/supabase/client"
import type { UserRole } from "./types"
import type { Database } from "@/types/database"

type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"]
type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"]

export async function ensureUserProfile(
  userId: string,
  email: string,
  role: UserRole,
  fullName?: string,
) {
  const supabase = createClient()

  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", userId)
    .maybeSingle()

  const profiles = supabase.from("profiles") as unknown as {
    update: (values: ProfileUpdate) => {
      eq: (column: string, value: string) => Promise<{ error: Error | null }>
    }
    insert: (values: ProfileInsert) => Promise<{ error: Error | null }>
  }

  if (existing) {
    const { error } = await profiles.update({
      full_name: fullName ?? null,
      role,
      updated_at: new Date().toISOString(),
    }).eq("id", userId)
    if (error) throw new Error(error.message)
    return
  }

  const { error } = await profiles.insert({
    id: userId,
    email,
    full_name: fullName ?? null,
    role,
  })
  if (error) throw new Error(error.message)
}
