"use client"

import { useCallback, useState } from "react"
import type { NovaMessage } from "./types"

const MOCK_REPLIES = [
  "En modo demo: tu score general es 78. Enfocate en agregar metricas a tus proyectos.",
  "Para la entrevista, prepara 2 historias STAR sobre trabajo en equipo.",
  "Tus skills mas fuertes son React y comunicacion. Practica preguntas tecnicas de hooks.",
  "Sube tu CV en el panel Nova para ver el analisis completo (simulado en esta beta).",
]

export function useNovaChat() {
  const [messages, setMessages] = useState<NovaMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hola, soy Nova. En esta beta de diseno respondo con datos de ejemplo para que explores la interfaz.",
    },
  ])
  const [loading, setLoading] = useState(false)

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed) return

    const userMsg: NovaMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: trimmed,
    }
    setMessages((prev) => [...prev, userMsg])
    setLoading(true)

    await new Promise((r) => setTimeout(r, 800))

    const reply =
      MOCK_REPLIES[Math.floor(Math.random() * MOCK_REPLIES.length)]
    setMessages((prev) => [
      ...prev,
      { id: `a-${Date.now()}`, role: "assistant", content: reply },
    ])
    setLoading(false)
  }, [])

  return { messages, loading, isTyping: loading, sendMessage }
}
