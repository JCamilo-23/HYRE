"use client"

import { motion } from "framer-motion"
import type { InterviewScores } from "../types"

interface ScoreCardsProps {
  scores: InterviewScores | null
}

const metrics = [
  { key: "overall_score", label: "Score global", color: "#7C3AED" },
  { key: "hire_probability", label: "Prob. contratación", color: "#06B6D4" },
  { key: "skill_match_pct", label: "Match skills", color: "#10B981" },
  { key: "confidence_score", label: "Confianza", color: "#F59E0B" },
  { key: "authenticity_score", label: "Autenticidad", color: "#EC4899" },
] as const

export function ScoreCards({ scores }: ScoreCardsProps) {
  if (!scores) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-sm text-[#64748B]">
        Esperando análisis en tiempo real…
      </div>
    )
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {metrics.map((m, i) => (
        <motion.div
          key={m.key}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl"
        >
          <p className="text-xs text-[#64748B]">{m.label}</p>
          <p className="font-display text-2xl font-semibold" style={{ color: m.color }}>
            {Math.round(scores[m.key as keyof InterviewScores] as number)}%
          </p>
        </motion.div>
      ))}
      <div className="col-span-full rounded-2xl border border-[#7C3AED]/30 bg-[#7C3AED]/10 p-4">
        <p className="text-xs uppercase tracking-wider text-[#C4B5FD]">Recomendación IA</p>
        <p className="mt-1 font-display text-lg font-semibold text-white capitalize">
          {scores.recommendation.replace(/_/g, " ")}
        </p>
        {scores.red_flags && scores.red_flags.length > 0 && (
          <ul className="mt-2 space-y-1 text-xs text-[#F87171]">
            {scores.red_flags.slice(0, 3).map((f) => (
              <li key={f}>• {f}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
