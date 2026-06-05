"use client"

export type PushPermissionStatus = NotificationPermission | "unsupported"

export function isPushSupported(): boolean {
  return false
}

export function getPushPermissionStatus(): PushPermissionStatus {
  return "unsupported"
}

export async function requestPushPermission(): Promise<boolean> {
  return false
}

export function showPushNotification(_payload: {
  title: string
  body?: string
  tag?: string
}): void {
  // Push deshabilitado en design beta
}
