import type { WorkSimulatorSession } from "@/modules/work-simulator/types"
import type { createClient } from "@/lib/supabase/server"

type SupabaseClient = Awaited<ReturnType<typeof createClient>>

export async function saveSession(
  session: WorkSimulatorSession,
  supabase: SupabaseClient,
): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("work_simulator_sessions")
    .upsert({
      id: session.id,
      user_id: session.user_id,
      job_id: session.job_id,
      role_title: session.role_title,
      company_name: session.company_name,
      scenario_context: session.scenario_context as Record<string, unknown>,
      messages: session.messages as unknown[],
      status: session.status,
    })
  if (error) throw error
}

export async function getSession(
  id: string,
  supabase: SupabaseClient,
): Promise<WorkSimulatorSession | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("work_simulator_sessions")
    .select("*")
    .eq("id", id)
    .single()
  if (error || !data) return null
  return data as unknown as WorkSimulatorSession
}
