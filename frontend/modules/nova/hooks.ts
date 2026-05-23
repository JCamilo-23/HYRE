"use client"

import { useCallback } from "react"
import { sendNovaMessage } from "./chat-service"
import { useNovaStore } from "@/store/nova-store"

export function useNovaChat() {
  const {
    messages,
    sessionId,
    isTyping,
    userName,
    appendMessage,
    setSessionId,
    setIsTyping,
  } = useNovaStore()

  const firstName = userName.split(" ")[0] || "amigo"

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim()
      if (!trimmed || isTyping) return

      appendMessage({ role: "user", content: trimmed })
      setIsTyping(true)

      try {
        const { reply, sessionId: nextSessionId } = await sendNovaMessage(trimmed, {
          sessionId,
          firstName,
        })
        setSessionId(nextSessionId)
        appendMessage({ role: "assistant", content: reply })
      } finally {
        setIsTyping(false)
      }
    },
    [appendMessage, firstName, isTyping, sessionId, setIsTyping, setSessionId],
  )

  return { messages, isTyping, sendMessage, firstName }
}
