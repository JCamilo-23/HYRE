"use client"

import { createClient } from "@/lib/supabase/client"

const FREE_LIMITS = { simulations: 3, copilot_messages: 10 }

export async function getRemainingUsage(userId: string) {
  const supabase = createClient()

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("plan")
    .eq("user_id", userId)
    .single() as { data: { plan: string } | null }

  if (sub?.plan !== "free") return { simulations: Infinity, copilot_messages: Infinity }

  const { count } = await supabase
    .from("simulations")
    .select("*", { count: "exact", head: true })
    .eq("candidate_id", userId)

  return {
    simulations: Math.max(0, FREE_LIMITS.simulations - (count ?? 0)),
    copilot_messages: FREE_LIMITS.copilot_messages,
  }
}

export async function canSimulate(userId: string): Promise<boolean> {
  const usage = await getRemainingUsage(userId)
  return usage.simulations > 0
}

export async function canAccessCopilot(userId: string): Promise<boolean> {
  const supabase = createClient()
  const { data } = await supabase
    .from("subscriptions")
    .select("plan")
    .eq("user_id", userId)
    .single() as { data: { plan: string } | null }
  return data?.plan !== "free"
}
