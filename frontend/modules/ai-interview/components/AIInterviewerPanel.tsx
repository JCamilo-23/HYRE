"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Bot, Loader2 } from "lucide-react"
import type { ConversationEntry } from "../types"

interface AIInterviewerPanelProps {
  agentName?: string | null
  agentRole?: string | null
  question: string | null
  connected: boolean
  thinking?: boolean
  speaking?: boolean
  phaseLabel?: string | null
  progressPct?: number
  conversation?: ConversationEntry[]
}

export function AIInterviewerPanel({
  question,
  connected,
  thinking = false,
  speaking = false,
  phaseLabel,
  progressPct = 0,
  conversation = [],
  agentName,
  agentRole,
}: AIInterviewerPanelProps) {
  const recent = conversation.slice(-6)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="text-[#C4B5FD]">
          {agentName ? `${agentName}${agentRole ? ` · ${agentRole}` : ""}` : phaseLabel ? `Fase: ${phaseLabel}` : "Entrevistador IA · HYRE"}
        </span>
        <span className="text-[#64748B]">{Math.round(progressPct)}% completado</span>
      </div>

      <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
        <motion.div
          className="h-full bg-gradient-to-r from-[#7C3AED] to-[#06B6D4]"
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, Math.max(0, progressPct))}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>

      <motion.div
        key={question ?? "empty"}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex gap-3 rounded-2xl border border-[#7C3AED]/30 bg-gradient-to-br from-[#7C3AED]/15 to-transparent p-4"
      >
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${
            connected ? "bg-[#7C3AED]/30" : "bg-white/5"
          }`}
        >
          {thinking ? (
            <Loader2 className="h-6 w-6 animate-spin text-[#C4B5FD]" />
          ) : (
            <Bot className={`h-6 w-6 ${connected ? "text-[#C4B5FD]" : "text-[#64748B]"}`} />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-[#C4B5FD]">
            {thinking
              ? "La IA está pensando…"
              : speaking
                ? "Entrevistador hablando…"
              : connected
                ? "Escuchando tu respuesta…"
                : "Conectando…"}
          </p>
          <AnimatePresence mode="wait">
            <motion.p
              key={question ?? "waiting"}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-1 text-sm font-medium leading-relaxed text-white"
            >
              {question ||
                (connected
                  ? thinking
                    ? "Preparando la siguiente pregunta…"
                    : "Escuchando tu respuesta…"
                  : "Conectando con el motor de entrevistas…")}
            </motion.p>
          </AnimatePresence>
        </div>
      </motion.div>

      {recent.length > 0 && (
        <div className="max-h-40 space-y-2 overflow-y-auto rounded-xl border border-white/10 bg-black/20 p-3">
          <p className="text-xs text-[#64748B]">Conversación</p>
          {recent.map((entry, i) => (
            <div
              key={`${entry.role}-${i}-${entry.content.slice(0, 24)}`}
              className={`text-xs leading-relaxed ${
                entry.role === "interviewer" ? "text-[#C4B5FD]" : "text-[#94A3B8]"
              }`}
            >
              <span className="font-medium">
                {entry.role === "interviewer" ? "IA" : "Tú"}:{" "}
              </span>
              {entry.content.length > 220 ? `${entry.content.slice(0, 220)}…` : entry.content}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
