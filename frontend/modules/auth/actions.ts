"use server"

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import type { UserRole } from "./types"

export async function signUp(email: string, password: string, fullName: string, role: UserRole) {
  const supabase = await createClient()
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName, role } },
  })
  if (error) throw new Error(error.message)
  redirect("/onboarding")
}

export async function signIn(email: string, password: string) {
  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw new Error(error.message)
  redirect("/")
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/login")
}

export async function getProfile() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle()
  return data
}

export async function updateCandidateProfile(payload: {
  city?: string
  career_stage?: string
  skills?: string[]
  bio?: string
  linkedin_url?: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("No autenticado")
  const { error } = await (supabase as any)
    .from("candidate_profiles")
    .update(payload)
    .eq("id", user.id)
  if (error) throw new Error(error.message)
}

export async function updateBusinessProfile(payload: {
  company_name?: string
  industry?: string
  company_size?: string
  city?: string
  website_url?: string
  description?: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("No autenticado")
  const { error } = await (supabase as any)
    .from("business_profiles")
    .update(payload)
    .eq("id", user.id)
  if (error) throw new Error(error.message)
}
