"use client"

import { useEffect, useState } from "react"

function formatElapsed(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
}

export function useInterviewTimer(active: boolean) {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    if (!active) return
    const id = setInterval(() => setElapsed((e) => e + 1), 1000)
    return () => clearInterval(id)
  }, [active])

  return { elapsed, formatted: formatElapsed(elapsed) }
}
