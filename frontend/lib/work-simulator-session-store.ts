import type { WorkSimulatorSession } from "@/modules/work-simulator/types"

const globalStore = globalThis as unknown as {
  workSimulatorSessions?: Map<string, WorkSimulatorSession>
}

function getStore(): Map<string, WorkSimulatorSession> {
  if (!globalStore.workSimulatorSessions) {
    globalStore.workSimulatorSessions = new Map()
  }
  return globalStore.workSimulatorSessions
}

export function saveSession(session: WorkSimulatorSession): void {
  getStore().set(session.id, session)
}

export function getSession(id: string): WorkSimulatorSession | undefined {
  return getStore().get(id)
}

export function updateSession(
  id: string,
  updater: (session: WorkSimulatorSession) => WorkSimulatorSession,
): WorkSimulatorSession | undefined {
  const current = getStore().get(id)
  if (!current) return undefined
  const updated = updater(current)
  getStore().set(id, updated)
  return updated
}
