"use client"

import { motion } from "framer-motion"
import { MessageCircle, Sparkles } from "lucide-react"
import { NOVA_BUBBLE_SIZE_PX } from "@/modules/nova"
import { cn } from "@/lib/utils"

interface NovaFloatingBubbleProps {
  isOpen: boolean
  onClick: () => void
  hasUnread?: boolean
}

export function NovaFloatingBubble({ isOpen, onClick, hasUnread }: NovaFloatingBubbleProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-label={isOpen ? "Minimizar Nova" : "Abrir chat con Nova"}
      aria-expanded={isOpen}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.94 }}
      animate={
        isOpen
          ? { scale: 1 }
          : {
              boxShadow: [
                "0 8px 32px rgba(124, 58, 237, 0.35)",
                "0 8px 40px rgba(6, 182, 212, 0.25)",
                "0 8px 32px rgba(124, 58, 237, 0.35)",
              ],
            }
      }
      transition={
        isOpen
          ? { duration: 0.2 }
          : { duration: 3, repeat: Infinity, ease: "easeInOut" }
      }
      className={cn(
        "group relative flex items-center justify-center rounded-full",
        "bg-gradient-to-br from-[#7C3AED] via-[#8B5CF6] to-[#06B6D4]",
        "border border-white/20 shadow-lg",
        "transition-shadow hover:shadow-[0_12px_40px_rgba(124,58,237,0.45)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3AED] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A12]",
      )}
      style={{ width: NOVA_BUBBLE_SIZE_PX, height: NOVA_BUBBLE_SIZE_PX }}
    >
      <span
        className="absolute inset-0 rounded-full bg-white/10 opacity-0 transition-opacity group-hover:opacity-100"
        aria-hidden
      />
      {isOpen ? (
        <MessageCircle className="relative h-6 w-6 text-white" />
      ) : (
        <Sparkles className="relative h-6 w-6 text-white" />
      )}
      {hasUnread && !isOpen && (
        <span
          className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-[#0A0A12] bg-[#10B981]"
          aria-hidden
        />
      )}
    </motion.button>
  )
}
