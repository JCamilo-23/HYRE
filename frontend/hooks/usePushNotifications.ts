"use client"

import { useState, useEffect } from "react"

export type PushStatus = "unsupported" | "denied" | "granted" | "default"

export function usePushNotifications() {
  const [status, setStatus] = useState<PushStatus>("default")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setStatus("unsupported")
      return
    }
    setStatus(Notification.permission as PushStatus)
  }, [])

  async function subscribe(): Promise<boolean> {
    if (!("serviceWorker" in navigator)) return false
    setLoading(true)
    try {
      const reg = await navigator.serviceWorker.register("/sw.js")
      await navigator.serviceWorker.ready

      const permission = await Notification.requestPermission()
      setStatus(permission as PushStatus)
      if (permission !== "granted") return false

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
        ),
      })

      const json = sub.toJSON()
      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(json),
      })

      return true
    } catch {
      return false
    } finally {
      setLoading(false)
    }
  }

  async function unsubscribe(): Promise<void> {
    if (!("serviceWorker" in navigator)) return
    const reg = await navigator.serviceWorker.getRegistration("/sw.js")
    if (!reg) return
    const sub = await reg.pushManager.getSubscription()
    if (!sub) return
    await fetch("/api/push/subscribe", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ endpoint: sub.endpoint }),
    })
    await sub.unsubscribe()
    setStatus("default")
  }

  return { status, loading, subscribe, unsubscribe }
}

function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")
  const raw = atob(base64)
  const arr = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i)
  return arr.buffer as ArrayBuffer
}
