"use client"

import { useEffect, useRef, useState } from "react"
import { Loader2, Send, Sparkles, Target } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useWorkSimulator } from "@/modules/work-simulator"
import { cn } from "@/lib/utils"

interface WorkSimulatorChatProps {
  roleTitle?: string
  companyName?: string
  jobId?: string
  className?: string
}

export function WorkSimulatorChat({
  roleTitle = "Desarrollador Frontend Jr",
  companyName = "TechCorp Colombia",
  jobId,
  className,
}: WorkSimulatorChatProps) {
  const {
    session,
    messages,
    currentChallenge,
    loading,
    error,
    startSession,
    sendMessage,
    requestChallenge,
    submitChallengeResponse,
  } = useWorkSimulator()

  const [input, setInput] = useState("")
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!session) {
      startSession({ role_title: roleTitle, company_name: companyName, job_id: jobId }).catch(
        () => undefined,
      )
    }
  }, [session, startSession, roleTitle, companyName, jobId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, loading])

  const handleSend = async () => {
    const text = input.trim()
    if (!text || loading) return
    setInput("")
    if (currentChallenge) {
      await submitChallengeResponse(text)
    } else {
      await sendMessage(text)
    }
  }

  return (
    <div
      className={cn(
        "flex h-full min-h-[480px] flex-col rounded-2xl border border-[#334155] bg-[#0F172A]",
        className,
      )}
      role="region"
      aria-label="Simulador laboral con IA"
    >
      <header className="flex items-center justify-between border-b border-[#334155] px-4 py-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-[#94A3B8]">
            Simulación IA
          </p>
          <h2 className="text-sm font-semibold text-[#F1F5F9]">
            {roleTitle} · {companyName}
          </h2>
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={loading || !!currentChallenge || !session}
          onClick={() => void requestChallenge()}
          className="border-[#7C3AED] text-[#C4B5FD] hover:bg-[#7C3AED]/20"
          aria-label="Generar nuevo reto laboral"
        >
          <Target className="mr-1 h-4 w-4" />
          Nuevo reto
        </Button>
      </header>

      <div
        className="flex-1 space-y-3 overflow-y-auto p-4"
        aria-live="polite"
        aria-relevant="additions"
      >
        {messages.map((msg, i) => (
          <div
            key={`${i}-${msg.role}`}
            className={cn(
              "max-w-[90%] rounded-2xl px-4 py-2 text-sm leading-relaxed",
              msg.role === "user"
                ? "ml-auto bg-[#7C3AED] text-white"
                : "mr-auto bg-[#1E293B] text-[#E2E8F0]",
            )}
          >
            <p className="whitespace-pre-wrap">{msg.content}</p>
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-[#94A3B8]" aria-busy="true">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Pensando...</span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {error && (
        <p className="px-4 text-sm text-red-400" role="alert">
          {error}
        </p>
      )}

      {currentChallenge && (
        <p className="px-4 text-xs text-[#F59E0B]">
          Modo reto activo: responde al escenario para recibir tu evaluación.
        </p>
      )}

      <footer className="border-t border-[#334155] p-3">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              currentChallenge
                ? "Escribe tu respuesta al reto..."
                : "Escribe un mensaje o «empezar»..."
            }
            rows={2}
            className="min-h-[44px] resize-none border-[#334155] bg-[#1E293B] text-[#F1F5F9]"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                void handleSend()
              }
            }}
            aria-label="Mensaje para el simulador"
          />
          <Button
            type="button"
            size="icon"
            disabled={loading || !input.trim()}
            onClick={() => void handleSend()}
            className="shrink-0 bg-[#7C3AED] hover:bg-[#6D28D9]"
            aria-label="Enviar mensaje"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="mt-2 flex items-center gap-1 text-[10px] text-[#64748B]">
          <Sparkles className="h-3 w-3" />
          Impulsado por Gemini · contexto conversacional
        </p>
      </footer>
    </div>
  )
}
