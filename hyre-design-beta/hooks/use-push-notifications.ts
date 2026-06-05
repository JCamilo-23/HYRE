"use client"

import { useCallback } from "react"
import { useTaskNotificationsStore } from "@/store/task-notifications-store"

export function usePushNotifications() {
  const permissionStatus = useTaskNotificationsStore((s) => s.permissionStatus)
  const permissionLoading = useTaskNotificationsStore((s) => s.permissionLoading)
  const pushEnabled = useTaskNotificationsStore((s) => s.pushEnabled)

  const requestPermission = useCallback(async () => {
    return false
  }, [])

  const notify = useCallback((_payload: { title: string; body?: string }) => {
    // Push deshabilitado en design beta
  }, [])

  return {
    permissionStatus,
    permissionLoading,
    pushEnabled,
    requestPermission,
    notify,
  }
}
