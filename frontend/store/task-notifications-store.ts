import { create } from "zustand"
import type { WorkChallenge } from "@/modules/work-simulator/types"
import type { PushPermissionStatus } from "@/lib/push-notifications"

export type TaskNotificationStatus = "active" | "upcoming" | "completed"

export interface TaskNotificationItem {
  id: string
  title: string
  description?: string
  status: TaskNotificationStatus
  urgency?: string
  assignedBy?: string
  simTimeLabel?: string
  deadlineAt?: string
  read: boolean
  createdAt: string
  source: "scheduled" | "manual" | "system"
}

interface TaskNotificationsState {
  items: TaskNotificationItem[]
  pushEnabled: boolean
  permissionStatus: PushPermissionStatus
  permissionLoading: boolean
  setPushEnabled: (enabled: boolean) => void
  setPermissionStatus: (status: PushPermissionStatus) => void
  setPermissionLoading: (loading: boolean) => void
  addScheduledAlert: (payload: {
    title: string
    description?: string
    simTimeLabel?: string
    source?: "scheduled" | "manual" | "system"
  }) => void
  syncActiveChallenge: (challenge: WorkChallenge | null) => void
  completeActiveTask: () => void
  syncUpcomingSlots: (
    slots: Array<{ id: string; simTimeLabel: string; label: string }>,
  ) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  unreadCount: () => number
  pendingCount: () => number
}

function challengeToItem(challenge: WorkChallenge): TaskNotificationItem {
  return {
    id: `active-${challenge.id}`,
    title: challenge.title,
    description: challenge.deliverable_description,
    status: "active",
    urgency: challenge.urgency,
    assignedBy: challenge.assigned_by,
    simTimeLabel: challenge.sim_time_label,
    deadlineAt: challenge.deadline_at,
    read: false,
    createdAt: new Date().toISOString(),
    source: "manual",
  }
}

export const useTaskNotificationsStore = create<TaskNotificationsState>((set, get) => ({
  items: [],
  pushEnabled: false,
  permissionStatus: "default",
  permissionLoading: false,

  setPushEnabled: (pushEnabled) => set({ pushEnabled }),
  setPermissionStatus: (permissionStatus) =>
    set({ permissionStatus, pushEnabled: permissionStatus === "granted" }),
  setPermissionLoading: (permissionLoading) => set({ permissionLoading }),

  addScheduledAlert: (payload) =>
    set((state) => ({
      items: [
        {
          id: crypto.randomUUID(),
          title: payload.title,
          description: payload.description,
          status: "upcoming",
          simTimeLabel: payload.simTimeLabel,
          read: false,
          createdAt: new Date().toISOString(),
          source: payload.source ?? "scheduled",
        },
        ...state.items,
      ],
    })),

  syncActiveChallenge: (challenge) =>
    set((state) => {
      const withoutActive = state.items.filter((i) => i.status !== "active")
      if (!challenge) {
        return { items: withoutActive }
      }
      const activeItem = challengeToItem(challenge)
      const existingIdx = withoutActive.findIndex((i) => i.id === activeItem.id)
      if (existingIdx >= 0) {
        const next = [...withoutActive]
        next[existingIdx] = { ...next[existingIdx], ...activeItem, status: "active" }
        return { items: [next[existingIdx], ...next.filter((_, i) => i !== existingIdx)] }
      }
      return { items: [activeItem, ...withoutActive] }
    }),

  completeActiveTask: () =>
    set((state) => ({
      items: state.items.map((item) =>
        item.status === "active"
          ? { ...item, status: "completed" as const, read: true }
          : item,
      ),
    })),

  syncUpcomingSlots: (slots) =>
    set((state) => {
      const preserved = state.items.filter(
        (i) => i.status === "active" || i.status === "completed" || i.source !== "scheduled",
      )
      const upcoming: TaskNotificationItem[] = slots.map((slot) => ({
        id: slot.id,
        title: slot.label,
        description: "Asignación automática programada",
        status: "upcoming",
        simTimeLabel: slot.simTimeLabel,
        read: true,
        createdAt: new Date().toISOString(),
        source: "scheduled",
      }))
      return { items: [...preserved, ...upcoming] }
    }),

  markAsRead: (id) =>
    set((state) => ({
      items: state.items.map((item) => (item.id === id ? { ...item, read: true } : item)),
    })),

  markAllAsRead: () =>
    set((state) => ({
      items: state.items.map((item) => ({ ...item, read: true })),
    })),

  unreadCount: () => get().items.filter((i) => !i.read && i.status !== "upcoming").length,

  pendingCount: () => {
    const { items } = get()
    const hasActive = items.some((i) => i.status === "active")
    const unreadAlerts = items.filter(
      (i) => !i.read && i.status !== "upcoming" && i.status !== "completed",
    ).length
    return (hasActive ? 1 : 0) + unreadAlerts
  },
}))
