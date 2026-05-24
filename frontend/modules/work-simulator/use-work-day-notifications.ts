"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import {
  COMPRESSED_SLOT_INTERVAL_MINUTES,
  WORK_DAY_NOTIFICATION_SLOTS,
  storageKeyCompressed,
  storageKeyNotified,
} from "./constants"
import type { GenerateChallengeOptions } from "./types"

interface UseWorkDayNotificationsOptions {
  sessionId: string | null
  simulationStartedAt: string | null
  compressedMode: boolean
  hasActiveChallenge: boolean
  loading: boolean
  onScheduledTask: (options: GenerateChallengeOptions) => Promise<void>
}

function showBrowserNotification(title: string, body: string) {
  if (typeof window === "undefined" || !("Notification" in window)) return
  if (Notification.permission !== "granted") return
  try {
    new Notification(title, {
      body,
      icon: "/icon-dark-32x32.png",
      tag: "work-simulator-task",
    })
  } catch {
    /* ignore */
  }
}

export function useWorkDayNotifications({
  sessionId,
  simulationStartedAt,
  compressedMode,
  hasActiveChallenge,
  loading,
  onScheduledTask,
}: UseWorkDayNotificationsOptions) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [nextSlotLabel, setNextSlotLabel] = useState<string | null>(null)
  const firingRef = useRef(false)

  const requestNotificationPermission = useCallback(async () => {
    if (typeof window === "undefined" || !("Notification" in window)) return false
    const perm = await Notification.requestPermission()
    const granted = perm === "granted"
    setNotificationsEnabled(granted)
    return granted
  }, [])

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setNotificationsEnabled(Notification.permission === "granted")
    }
  }, [])

  useEffect(() => {
    if (!sessionId) return

    const tick = async () => {
      if (loading || hasActiveChallenge || firingRef.current) return

      const now = new Date()

      if (compressedMode && simulationStartedAt) {
        const elapsed = (now.getTime() - new Date(simulationStartedAt).getTime()) / 60_000
        const slotIndex = Math.floor(elapsed / COMPRESSED_SLOT_INTERVAL_MINUTES)
        if (slotIndex <= 0) return

        const key = storageKeyCompressed(sessionId, slotIndex)
        if (sessionStorage.getItem(key)) return

        const template = WORK_DAY_NOTIFICATION_SLOTS[slotIndex % WORK_DAY_NOTIFICATION_SLOTS.length]
        firingRef.current = true
        sessionStorage.setItem(key, "1")
        showBrowserNotification(
          `${template.simTimeLabel} — Nueva tarea`,
          template.label,
        )
        await onScheduledTask({
          source: "scheduled",
          slot_label: template.label,
          work_block: template.block,
          sim_time_label: template.simTimeLabel,
        })
        firingRef.current = false
        return
      }

      const upcoming = WORK_DAY_NOTIFICATION_SLOTS.find((slot) => {
        const slotDate = new Date()
        slotDate.setHours(slot.hour, slot.minute, 0, 0)
        return slotDate.getTime() > now.getTime()
      })
      setNextSlotLabel(
        upcoming
          ? `${upcoming.simTimeLabel} — ${upcoming.label}`
          : "Mañana a las 09:00",
      )

      for (const slot of WORK_DAY_NOTIFICATION_SLOTS) {
        if (now.getHours() !== slot.hour) continue
        if (Math.abs(now.getMinutes() - slot.minute) > 2) continue

        const key = storageKeyNotified(sessionId, slot.hour, slot.minute)
        if (sessionStorage.getItem(key)) continue

        firingRef.current = true
        sessionStorage.setItem(key, "1")
        showBrowserNotification(
          `${slot.simTimeLabel} — Nueva asignación`,
          slot.label,
        )
        await onScheduledTask({
          source: "scheduled",
          slot_label: slot.label,
          work_block: slot.block,
          sim_time_label: slot.simTimeLabel,
        })
        firingRef.current = false
        break
      }
    }

    const id = window.setInterval(() => void tick(), 30_000)
    void tick()
    return () => window.clearInterval(id)
  }, [
    sessionId,
    simulationStartedAt,
    compressedMode,
    hasActiveChallenge,
    loading,
    onScheduledTask,
  ])

  return {
    notificationsEnabled,
    nextSlotLabel,
    requestNotificationPermission,
  }
}
