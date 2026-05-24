"use client"

export type PushPermissionStatus = NotificationPermission | "unsupported"

const PERMISSION_ASKED_KEY = "hyre-push-permission-asked"

export function isPushSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window
}

export function getPushPermissionStatus(): PushPermissionStatus {
  if (!isPushSupported()) return "unsupported"
  return Notification.permission
}

export function wasPushPermissionAsked(): boolean {
  if (typeof window === "undefined") return false
  return localStorage.getItem(PERMISSION_ASKED_KEY) === "1"
}

export function markPushPermissionAsked(): void {
  if (typeof window === "undefined") return
  localStorage.setItem(PERMISSION_ASKED_KEY, "1")
}

export async function requestPushPermission(): Promise<boolean> {
  if (!isPushSupported()) return false

  markPushPermissionAsked()

  if (Notification.permission === "granted") return true
  if (Notification.permission === "denied") return false

  const result = await Notification.requestPermission()
  return result === "granted"
}

export interface PushNotificationPayload {
  title: string
  body: string
  tag?: string
  url?: string
}

export function showPushNotification({
  title,
  body,
  tag = "hyre-work-task",
  url,
}: PushNotificationPayload): void {
  if (!isPushSupported() || Notification.permission !== "granted") return

  try {
    const notification = new Notification(title, {
      body,
      icon: "/icon-dark-32x32.png",
      badge: "/icon-dark-32x32.png",
      tag,
      requireInteraction: true,
    })

    notification.onclick = () => {
      window.focus()
      if (url) window.location.href = url
      notification.close()
    }
  } catch {
    /* ignore */
  }
}
