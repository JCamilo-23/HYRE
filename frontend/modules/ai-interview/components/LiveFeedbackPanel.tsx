"use client"

import { motion, AnimatePresence } from "framer-motion"
import { TrendingUp, AlertCircle, Sparkles } from "lucide-react"
import type { LiveFeedback } from "../types"

interface LiveFeedbackPanelProps {
  feedback: LiveFeedback | null
}

export function LiveFeedbackPanel({ feedback }: LiveFeedbackPanelProps) {
  if (!feedback) return null

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={feedback.headline}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-xl"
      >
        <div className="flex items-start gap-2">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-[#06B6D4]" />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium uppercase tracking-wider text-[#06B6D4]">
              Feedback en vivo
            </p>
            <p className="mt-1 text-sm text-[#E2E8F0]">{feedback.headline}</p>
          </div>
        </div>

        {feedback.strengths.length > 0 && (
          <ul className="mt-3 space-y-1.5">
            {feedback.strengths.map((s) => (
              <li key={s} className="flex gap-2 text-xs text-[#A7F3D0]">
                <TrendingUp className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        )}

        {feedback.improvements.length > 0 && (
          <ul className="mt-2 space-y-1.5">
            {feedback.improvements.map((s) => (
              <li key={s} className="flex gap-2 text-xs text-[#FDE68A]">
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        )}

        {feedback.highlight_skills.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {feedback.highlight_skills.map((skill) => (
              <span
                key={skill}
                className="rounded-full border border-[#7C3AED]/40 bg-[#7C3AED]/15 px-2 py-0.5 text-[10px] text-[#C4B5FD]"
              >
                {skill}
              </span>
            ))}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}
