import { createClient } from "@/lib/supabase/client"
import type { Job } from "./types"

export async function getJobs(): Promise<Job[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("status", "active")
    .order("created_at", { ascending: false })
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function getJobById(id: string): Promise<Job | null> {
  const supabase = createClient()
  const { data, error } = await supabase.from("jobs").select("*").eq("id", id).single()
  if (error) return null
  return data
}
