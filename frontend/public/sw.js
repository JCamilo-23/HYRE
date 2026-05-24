self.addEventListener("push", (event) => {
  if (!event.data) return

  const data = event.data.json()
  const { title, body, icon, url } = data

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: icon || "/apple-icon.png",
      badge: "/icon-dark-32x32.png",
      data: { url: url || "/" },
      vibrate: [200, 100, 200],
    })
  )
})

self.addEventListener("notificationclick", (event) => {
  event.notification.close()
  const url = event.notification.data?.url || "/"
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === url && "focus" in client) return client.focus()
      }
      if (clients.openWindow) return clients.openWindow(url)
    })
  )
})
