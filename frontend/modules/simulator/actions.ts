"use server"

import { createClient } from "@/lib/supabase/server"
import type { CreateSimulationInput } from "./types"

export async function createSimulation(input: CreateSimulationInput) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any
  const { data, error } = await sb
    .from("simulations")
    .insert([{ job_id: input.job_id, candidate_id: user.id, status: "pending" }])
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function updateSimulationResult(id: string, videoUrl: string, analysis: any, score: number) {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("simulations")
    .update({ status: "completed", video_url: videoUrl, analysis, score, completed_at: new Date().toISOString() })
    .eq("id", id)
  if (error) throw new Error(error.message)
}

export async function getMySimulations() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []
  const { data } = await supabase.from("simulations").select("*").eq("candidate_id", user.id).order("created_at", { ascending: false })
  return data ?? []
}
