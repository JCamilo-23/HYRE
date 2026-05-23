"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import type { CreateJobInput } from "./types"

export async function createJob(input: CreateJobInput) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any
  const { data, error } = await sb
    .from("jobs")
    .insert([{ ...input, company_id: user.id, status: "active" }])
    .select()
    .single()

  if (error) throw new Error(error.message)
  revalidatePath("/jobs")
  return data
}

export async function updateJobStatus(id: string, status: "active" | "paused" | "closed") {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).from("jobs").update({ status }).eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath("/jobs")
}
