"use client"

import { motion } from "framer-motion"
import { Bot } from "lucide-react"

interface AIInterviewerPanelProps {
  question: string | null
  connected: boolean
}

export function AIInterviewerPanel({ question, connected }: AIInterviewerPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-3 rounded-2xl border border-[#7C3AED]/30 bg-gradient-to-br from-[#7C3AED]/15 to-transparent p-4"
    >
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${
          connected ? "bg-[#7C3AED]/30" : "bg-white/5"
        }`}
      >
        <Bot className={`h-6 w-6 ${connected ? "text-[#C4B5FD]" : "text-[#64748B]"}`} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-[#C4B5FD]">Entrevistador IA · Gemini Pro</p>
        <p className="mt-1 text-sm leading-relaxed text-white">
          {question ||
            (connected
              ? "Preparando la primera pregunta…"
              : "Conectando con el motor de entrevistas…")}
        </p>
      </div>
    </motion.div>
  )
}
