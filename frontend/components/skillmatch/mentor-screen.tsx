"use client"

import { useEffect } from "react"
import { Screen } from "@/lib/hyre-types"
import { useNovaStore } from "@/store/nova-store"

interface MentorScreenProps {
  onNavigate: (screen: Screen) => void
}

/** Abre el panel flotante de Nova y vuelve al inicio */
export function MentorScreen({ onNavigate }: MentorScreenProps) {
  const open = useNovaStore((s) => s.open)

  useEffect(() => {
    open()
    onNavigate("home")
  }, [open, onNavigate])

  return null
}
