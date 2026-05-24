"use client"

import { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Loader2, Send, Sparkles, X } from "lucide-react"
import { NOVA_SUGGESTIONS } from "@/modules/nova"
import { useNovaChat } from "@/modules/nova/hooks"
import { cn } from "@/lib/utils"

interface NovaChatPanelProps {
  onClose: () => void
  className?: string
}

export function NovaChatPanel({ onClose, className }: NovaChatPanelProps) {
  const { messages, isTyping, sendMessage } = useNovaChat()
  const [input, setInput] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isTyping])

  const handleSend = async (text?: string) => {
    const value = (text ?? input).trim()
    if (!value) return
    setInput("")
    await sendMessage(value)
  }

  return (
    <div
      role="dialog"
      aria-label="Chat con Nova"
      className={cn(
        "flex flex-col overflow-hidden rounded-2xl border border-white/10",
        "bg-[#0A0A12] shadow-2xl shadow-[#7C3AED]/20",
        className,
      )}
    >
      <header className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#06B6D4]">
            <Sparkles className="h-5 w-5 text-[#F1F5F9]" aria-hidden />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#F1F5F9]">Nova</p>
            <p className="text-xs text-[#94A3B8]">Tu mentor de carrera IA</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-2 text-[#94A3B8] transition-colors hover:bg-white/10 hover:text-[#F1F5F9]"
          aria-label="Cerrar chat de Nova"
        >
          <X className="h-4 w-4" />
        </button>
      </header>

      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4" aria-live="polite">
        <AnimatePresence initial={false}>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "flex",
                message.role === "user" ? "justify-end" : "justify-start",
              )}
            >
              <div
                className={cn(
                  "max-w-[88%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                  message.role === "user"
                    ? "bg-[#7C3AED] text-[#F1F5F9]"
                    : "bg-[#1E293B] text-[#F1F5F9] border border-white/5",
                )}
              >
                {message.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2 rounded-2xl border border-white/5 bg-[#1E293B] px-4 py-2.5">
              <Loader2 className="h-4 w-4 animate-spin text-[#7C3AED]" />
              <span className="text-xs text-[#94A3B8]">Nova está escribiendo...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {messages.length <= 2 && (
        <div className="px-4 pb-2">
          <p className="mb-2 text-[10px] uppercase tracking-wide text-[#475569]">
            Sugerencias
          </p>
          <div className="flex flex-wrap gap-2">
            {NOVA_SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => void handleSend(suggestion)}
                className="rounded-full border border-white/5 bg-[#1E293B] px-3 py-1.5 text-xs text-[#94A3B8] transition-colors hover:bg-[#334155] hover:text-[#F1F5F9]"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      <footer className="border-t border-white/10 p-3">
        <div className="flex items-center gap-2 rounded-2xl border border-white/5 bg-[#1E293B] p-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                void handleSend()
              }
            }}
            placeholder="Escribe tu mensaje..."
            className="flex-1 bg-transparent px-3 py-2 text-sm text-[#F1F5F9] outline-none placeholder:text-[#475569]"
            aria-label="Mensaje para Nova"
          />
          <button
            type="button"
            onClick={() => void handleSend()}
            disabled={!input.trim() || isTyping}
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-xl transition-colors",
              input.trim() && !isTyping
                ? "bg-[#7C3AED] text-[#F1F5F9] hover:bg-[#6D28D9]"
                : "bg-[#1A1A2E] text-[#475569]",
            )}
            aria-label="Enviar mensaje"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </footer>
    </div>
  )
}
