"use client"

import { api } from "@/lib/api-client"

export interface CopilotMessage {
  role: "user" | "assistant"
  content: string
}

export async function sendCopilotMessage(message: string, sessionId?: string) {
  return api.post<{ session_id: string; reply: string }>("/api/v1/copilot/message", {
    message,
    session_id: sessionId ?? null,
  })
}
