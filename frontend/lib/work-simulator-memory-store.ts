import type { WorkSimulatorSession } from "@/modules/work-simulator/types"

// In-memory store — persiste mientras el servidor Next.js esté corriendo.
// Sirve para sesiones de demo sin autenticación de Supabase.
const store = new Map<string, WorkSimulatorSession>()

export function memSave(session: WorkSimulatorSession): void {
  store.set(session.id, session)
}

export function memGet(id: string): WorkSimulatorSession | null {
  return store.get(id) ?? null
}
