"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Check, X } from "lucide-react"
import { PASSWORD_RULES, getPasswordStrength } from "@/lib/utils"

interface PasswordStrengthIndicatorProps {
  password: string
  visible: boolean
}

const STRENGTH_CONFIG = {
  weak:   { label: "Débil",  color: "bg-red-500",    segments: 1, textColor: "text-red-400" },
  medium: { label: "Media",  color: "bg-yellow-500", segments: 3, textColor: "text-yellow-400" },
  strong: { label: "Fuerte", color: "bg-emerald-500",segments: 5, textColor: "text-emerald-400" },
}

export function PasswordStrengthIndicator({ password, visible }: PasswordStrengthIndicatorProps) {
  const strength = getPasswordStrength(password)
  const config = STRENGTH_CONFIG[strength]

  return (
    <AnimatePresence>
      {visible && password.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
          className="mt-2 rounded-xl bg-[#0F0F1A] border border-white/10 p-3 space-y-2"
        >
          {/* Barra de fortaleza */}
          <div className="flex items-center gap-2">
            <div className="flex gap-1 flex-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                    i <= config.segments ? config.color : "bg-white/10"
                  }`}
                />
              ))}
            </div>
            <span className={`text-xs font-medium ${config.textColor}`}>
              {config.label}
            </span>
          </div>

          {/* Lista de requisitos */}
          <ul className="space-y-1">
            {PASSWORD_RULES.map((rule) => {
              const ok = rule.test(password)
              return (
                <li key={rule.label} className="flex items-center gap-2">
                  {ok ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  ) : (
                    <X className="w-3.5 h-3.5 text-white/30 shrink-0" />
                  )}
                  <span className={`text-xs ${ok ? "text-emerald-400" : "text-white/40"}`}>
                    {rule.label}
                  </span>
                </li>
              )
            })}
          </ul>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
