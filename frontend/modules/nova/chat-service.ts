import type { NovaMessage } from "./types"
import { getNovaFallbackReply } from "./fallback-replies"

async function callNovaApi(
  message: string,
  options: {
    sessionId?: string | null
    firstName: string
    history: NovaMessage[]
  },
): Promise<{ reply: string; sessionId: string }> {
  const res = await fetch("/api/nova/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      history: options.history.map(({ role, content }) => ({ role, content })),
      firstName: options.firstName,
      sessionId: options.sessionId,
    }),
  })

  const data = (await res.json()) as { reply?: string; session_id?: string; detail?: string }

  if (!res.ok || !data.reply) {
    throw new Error(data.detail ?? "Nova API error")
  }

  return { reply: data.reply, sessionId: data.session_id ?? crypto.randomUUID() }
}

export async function sendNovaMessage(
  message: string,
  options: {
    sessionId?: string | null
    firstName: string
    history: NovaMessage[]
  },
): Promise<{ reply: string; sessionId: string }> {
  try {
    return await callNovaApi(message, options)
  } catch {
    return {
      reply: getNovaFallbackReply(message, options.firstName),
      sessionId: options.sessionId ?? crypto.randomUUID(),
    }
  }
}

export function buildGreeting(firstName: string): string {
  const name = firstName && firstName !== "Usuario" ? firstName : "amigo"
  return `Hola ${name}! Soy Nova, tu mentor de carrera IA. Estoy aquí para ayudarte a mejorar tus habilidades y prepararte para el éxito. ¿Qué te gustaría saber hoy?`
}
