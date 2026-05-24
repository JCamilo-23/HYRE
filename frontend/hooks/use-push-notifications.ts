"use client"

import { useCallback, useEffect } from "react"
import {
  getPushPermissionStatus,
  requestPushPermission,
  showPushNotification,
  type PushNotificationPayload,
} from "@/lib/push-notifications"
import { useTaskNotificationsStore } from "@/store/task-notifications-store"

export function usePushNotifications() {
  const permissionStatus = useTaskNotificationsStore((s) => s.permissionStatus)
  const permissionLoading = useTaskNotificationsStore((s) => s.permissionLoading)
  const pushEnabled = useTaskNotificationsStore((s) => s.pushEnabled)
  const setPermissionStatus = useTaskNotificationsStore((s) => s.setPermissionStatus)
  const setPermissionLoading = useTaskNotificationsStore((s) => s.setPermissionLoading)

  useEffect(() => {
    setPermissionStatus(getPushPermissionStatus())
  }, [setPermissionStatus])

  const requestPermission = useCallback(async () => {
    setPermissionLoading(true)
    try {
      const granted = await requestPushPermission()
      setPermissionStatus(getPushPermissionStatus())
      return granted
    } finally {
      setPermissionLoading(false)
    }
  }, [setPermissionLoading, setPermissionStatus])

  const notify = useCallback((payload: PushNotificationPayload) => {
    showPushNotification(payload)
  }, [])

  return {
    permissionStatus,
    permissionLoading,
    pushEnabled,
    requestPermission,
    notify,
  }
}
