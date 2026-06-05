import type { NovaMessage } from "./types"

export function buildGreeting(firstName: string): string {
  const name = firstName && firstName !== "Usuario" ? firstName : "amigo"
  return `Hola ${name}! Soy Nova, tu mentor de carrera IA. En esta beta de diseno respondo con datos de ejemplo. ¿Que te gustaria saber hoy?`
}

export async function sendNovaMessage(
  message: string,
  options: {
    sessionId?: string | null
    firstName: string
    history: NovaMessage[]
  },
): Promise<{ reply: string; sessionId: string }> {
  await new Promise((r) => setTimeout(r, 600))
  return {
    reply: `Demo: buena pregunta sobre "${message.slice(0, 40)}...". En produccion Nova usaria IA real.`,
    sessionId: options.sessionId ?? crypto.randomUUID(),
  }
}
