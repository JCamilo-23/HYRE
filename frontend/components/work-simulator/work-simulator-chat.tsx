"use client"

import { useEffect, useRef, useState } from "react"
import { Clock, Loader2, Send, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { TaskNotificationBell } from "@/components/notifications/task-notification-bell"
import { useWorkSimulator } from "@/modules/work-simulator"
import { cn } from "@/lib/utils"

interface WorkSimulatorChatProps {
  roleTitle?: string
  companyName?: string
  jobId?: string
  className?: string
}

function formatTimeLeft(seconds: number): string {
  if (seconds <= 0) return "⏰ Deadline vencido"
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, "0")}`
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
    compressedMode,
    setCompressedMode,
    timeLeftSeconds,
    notificationsEnabled,
    nextSlotLabel,
    requestNotificationPermission,
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
        "flex h-full min-h-[520px] flex-col rounded-2xl border border-[#334155] bg-[#0F172A]",
        className,
      )}
      role="region"
      aria-label="Simulador laboral con IA"
    >
      <header className="space-y-2 border-b border-[#334155] px-4 py-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-[#94A3B8]">
              Jornada laboral simulada
            </p>
            <h2 className="text-sm font-semibold text-[#F1F5F9]">
              {roleTitle} · {companyName}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {currentChallenge && timeLeftSeconds !== null && (
              <div
                className={cn(
                  "flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-mono",
                  timeLeftSeconds <= 0
                    ? "bg-red-500/20 text-red-400"
                    : timeLeftSeconds < 300
                      ? "bg-amber-500/20 text-amber-400"
                      : "bg-[#1E293B] text-[#94A3B8]",
                )}
              >
                <Clock className="h-3 w-3" />
                {formatTimeLeft(timeLeftSeconds)}
              </div>
            )}
            <TaskNotificationBell
              variant="header"
              notificationsEnabled={notificationsEnabled}
              onRequestPermission={requestNotificationPermission}
              timeLeftSeconds={timeLeftSeconds}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={loading || !!currentChallenge || !session}
            onClick={() => void requestChallenge({ source: "manual" })}
            className="h-7 border-[#7C3AED] text-xs text-[#C4B5FD] hover:bg-[#7C3AED]/20"
          >
            Solicitar tarea
          </Button>

          <Button
            type="button"
            size="sm"
            variant={compressedMode ? "default" : "outline"}
            onClick={() => setCompressedMode((v) => !v)}
            className={cn("h-7 text-xs", compressedMode && "bg-[#06B6D4] hover:bg-[#0891B2]")}
          >
            {compressedMode ? "Demo rápido ON" : "Demo rápido"}
          </Button>
        </div>

        {nextSlotLabel && (
          <p className="text-[10px] text-[#64748B]">
            Próxima asignación automática: {nextSlotLabel}
            {compressedMode && " · cada 8 min (modo demo)"}
          </p>
        )}
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
              "max-w-[92%] rounded-2xl px-4 py-2 text-sm leading-relaxed",
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
            <span className="text-sm">Procesando...</span>
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
        <div className="border-t border-amber-500/20 bg-amber-500/5 px-4 py-2">
          <p className="text-xs font-medium text-amber-400">Tarea activa — entrega tu trabajo completo</p>
          <p className="text-[11px] text-[#94A3B8]">{currentChallenge.deliverable_description}</p>
        </div>
      )}

      <footer className="border-t border-[#334155] p-3">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              currentChallenge
                ? "Escribe tu entregable completo (correo, informe, plan...)"
                : "Escribe «empezar jornada» para tu primera asignación..."
            }
            rows={3}
            className="min-h-[60px] resize-none border-[#334155] bg-[#1E293B] text-[#F1F5F9]"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                void handleSend()
              }
            }}
            aria-label="Entregable de la tarea"
          />
          <Button
            type="button"
            size="icon"
            disabled={loading || !input.trim()}
            onClick={() => void handleSend()}
            className="shrink-0 self-end bg-[#7C3AED] hover:bg-[#6D28D9]"
            aria-label="Enviar entregable"
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
          Trabajos reales · evaluación exigente · notificaciones en horario laboral
        </p>
      </footer>
    </div>
  )
}
