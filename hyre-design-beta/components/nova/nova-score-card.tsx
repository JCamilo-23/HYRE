"use client"

import { motion } from "framer-motion"
import type { NovaAnalysis } from "@/modules/nova/types"

interface NovaScoreCardProps {
  analysis: NovaAnalysis
}

const SCORE_LABELS: Record<string, string> = {
  score_general: "General",
  score_ats: "ATS",
  score_technical: "Técnico",
  score_recruiter: "Recruiter",
  score_visual: "Visual",
  score_communication: "Comunicación",
}

function scoreColor(score: number) {
  if (score >= 80) return { text: "text-emerald-600", bg: "bg-emerald-500", ring: "ring-emerald-200" }
  if (score >= 60) return { text: "text-amber-600", bg: "bg-amber-500", ring: "ring-amber-200" }
  return { text: "text-red-600", bg: "bg-red-500", ring: "ring-red-200" }
}

function ScoreRing({ score, size = 80 }: { score: number; size?: number }) {
  const radius = (size - 12) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - score / 100)
  const { text, bg } = scoreColor(score)

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke="currentColor" strokeWidth={8} className="text-zinc-100 dark:text-zinc-800" />
        <motion.circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" strokeWidth={8}
          stroke="currentColor"
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
          strokeLinecap="round"
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className={bg.replace("bg-", "text-")}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`text-base font-bold ${text}`}>{score}</span>
      </div>
    </div>
  )
}

export function NovaScoreCard({ analysis }: NovaScoreCardProps) {
  const mainScore = analysis.score_general
  const { text: mainText } = scoreColor(mainScore)

  const subScores = [
    { key: "score_ats", value: analysis.score_ats },
    { key: "score_technical", value: analysis.score_technical },
    { key: "score_recruiter", value: analysis.score_recruiter },
    { key: "score_visual", value: analysis.score_visual },
    { key: "score_communication", value: analysis.score_communication },
  ]

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6">
      {/* Main score */}
      <div className="flex items-center gap-6 mb-6">
        <ScoreRing score={mainScore} size={96} />
        <div>
          <p className="text-sm text-zinc-500 mb-1">Puntuación general</p>
          <p className={`text-4xl font-black ${mainText}`}>{mainScore}</p>
          <p className="text-sm text-zinc-500 mt-1">
            {mainScore >= 80 ? "CV competitivo" : mainScore >= 60 ? "Requiere mejoras" : "Necesita trabajo"}
          </p>
        </div>
      </div>

      {/* Sub-scores */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {subScores.map(({ key, value }, i) => {
          const { text, bg } = scoreColor(value)
          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="flex flex-col gap-1"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-500">{SCORE_LABELS[key]}</span>
                <span className={`text-xs font-bold ${text}`}>{value}</span>
              </div>
              <div className="h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${bg}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${value}%` }}
                  transition={{ duration: 0.8, delay: i * 0.08 + 0.3, ease: "easeOut" }}
                />
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Model badge */}
      <p className="mt-4 text-xs text-zinc-400 text-right">
        Analizado con {analysis.model_used} · {Math.round(analysis.processing_time_ms / 1000)}s
      </p>
    </div>
  )
}
