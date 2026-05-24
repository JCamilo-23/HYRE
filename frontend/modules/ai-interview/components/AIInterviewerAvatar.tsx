"use client"

import { motion } from "framer-motion"
import { Bot, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface AIInterviewerAvatarProps {
  agentName?: string | null
  connected: boolean
  thinking?: boolean
  speaking?: boolean
  size?: "md" | "lg"
}

export function AIInterviewerAvatar({
  agentName,
  connected,
  thinking = false,
  speaking = false,
  size = "lg",
}: AIInterviewerAvatarProps) {
  const dim = size === "lg" ? "h-28 w-28 sm:h-32 sm:w-32" : "h-20 w-20"
  const icon = size === "lg" ? "h-10 w-10" : "h-7 w-7"

  return (
    <div className="relative flex flex-col items-center">
      {speaking && !thinking && (
        <>
          <motion.span
            className="absolute inset-0 rounded-full border border-[#7C3AED]/50"
            animate={{ scale: [1, 1.35, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
          />
          <motion.span
            className="absolute inset-0 rounded-full border border-[#06B6D4]/40"
            animate={{ scale: [1, 1.55, 1], opacity: [0.4, 0, 0.4] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeOut", delay: 0.3 }}
          />
        </>
      )}

      <motion.div
        className={cn(
          "relative flex items-center justify-center rounded-full border backdrop-blur-xl",
          dim,
          connected
            ? "border-[#7C3AED]/40 bg-gradient-to-br from-[#7C3AED]/30 to-[#06B6D4]/10 shadow-[0_0_48px_rgba(124,58,237,0.35)]"
            : "border-white/10 bg-white/5",
          speaking && !thinking && "shadow-[0_0_64px_rgba(124,58,237,0.5)]",
        )}
        animate={
          speaking && !thinking
            ? { scale: [1, 1.03, 1] }
            : thinking
              ? { scale: [1, 1.02, 1] }
              : { scale: 1 }
        }
        transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
      >
        {thinking ? (
          <Loader2 className={cn(icon, "animate-spin text-[#C4B5FD]")} />
        ) : (
          <Bot className={cn(icon, connected ? "text-[#C4B5FD]" : "text-[#64748B]")} />
        )}
      </motion.div>

      {agentName && (
        <p className="mt-3 max-w-[140px] truncate text-center text-xs font-medium text-[#C4B5FD]">
          {agentName}
        </p>
      )}

      <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-[#64748B]">
        {thinking ? "Pensando…" : speaking ? "Hablando" : connected ? "En línea" : "Conectando"}
      </p>

      {speaking && !thinking && (
        <div className="mt-3 flex items-end justify-center gap-1">
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.span
              key={i}
              className="w-1 rounded-full bg-gradient-to-t from-[#7C3AED] to-[#06B6D4]"
              animate={{ height: [6, 18, 8, 22, 6] }}
              transition={{
                duration: 0.9,
                repeat: Infinity,
                delay: i * 0.1,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
