"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, Send, Sparkles, Loader2 } from "lucide-react"
import { Screen, UserData } from "@/app/page"

interface MentorScreenProps {
  onNavigate: (screen: Screen) => void
  userData: UserData
}

interface Message {
  id: number
  role: "user" | "assistant"
  content: string
}

const suggestions = [
  "Como puedo mejorar mi score?",
  "Preparame para mi proxima entrevista",
  "Que habilidades debo desarrollar?",
  "Analiza mi perfil",
]

export function MentorScreen({ onNavigate, userData }: MentorScreenProps) {
  const firstName = userData.name ? userData.name.split(" ")[0] : "amigo"
  
  const initialMessages: Message[] = [
    {
      id: 1,
      role: "assistant",
      content: `Hola ${firstName}! Soy Nova, tu mentor de carrera IA. Estoy aqui para ayudarte a mejorar tus habilidades y prepararte para el exito. Que te gustaria saber hoy?`,
    },
  ]

  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sessionIdRef = useRef<string | undefined>(undefined)

  const handleSend = async (text?: string) => {
    const messageText = text || input
    if (!messageText.trim()) return

    const userMessage: Message = { id: messages.length + 1, role: "user", content: messageText }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsTyping(true)

    try {
      const { sendCopilotMessage } = await import("@/modules/copilot")
      const data = await sendCopilotMessage(messageText, sessionIdRef.current)
      sessionIdRef.current = data.session_id
      setMessages((prev) => [...prev, { id: prev.length + 1, role: "assistant", content: data.reply }])
    } catch {
      setMessages((prev) => [...prev, { id: prev.length + 1, role: "assistant", content: "Hubo un error al conectar con el mentor. Intenta de nuevo." }])
    } finally {
      setIsTyping(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A12]">
      {/* Header */}
      <div className="flex items-center gap-4 px-6 py-4 glass">
        <button
          onClick={() => onNavigate("home")}
          className="text-[#94A3B8] hover:text-[#F1F5F9] transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#06B6D4] flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-[#F1F5F9]" />
          </div>
          <div>
            <p className="text-[#F1F5F9] font-medium">Nova</p>
            <p className="text-[#94A3B8] text-xs">Tu mentor de carrera IA</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] px-4 py-3 rounded-2xl ${
                  message.role === "user"
                    ? "bg-[#7C3AED] text-[#F1F5F9]"
                    : "glass text-[#F1F5F9]"
                }`}
              >
                <p className="text-sm leading-relaxed">{message.content}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="glass px-4 py-3 rounded-2xl flex items-center gap-2">
              <Loader2 className="w-4 h-4 text-[#7C3AED] animate-spin" />
              <span className="text-[#94A3B8] text-sm">Nova esta escribiendo...</span>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      {messages.length <= 2 && (
        <div className="px-4 pb-2">
          <p className="text-[#475569] text-xs mb-2">Sugerencias:</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => handleSend(suggestion)}
                className="px-3 py-1.5 glass rounded-full text-[#94A3B8] text-xs hover:text-[#F1F5F9] hover:bg-white/10 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="px-4 pb-6 safe-area-bottom">
        <div className="flex items-center gap-2 glass rounded-2xl p-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Escribe tu mensaje..."
            className="flex-1 bg-transparent text-[#F1F5F9] text-sm px-3 py-2 outline-none placeholder:text-[#475569]"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isTyping}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
              input.trim() && !isTyping
                ? "bg-[#7C3AED] text-[#F1F5F9]"
                : "bg-[#1A1A2E] text-[#475569]"
            }`}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
