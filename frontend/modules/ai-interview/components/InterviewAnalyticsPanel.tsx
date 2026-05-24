"use client"

import { motion } from "framer-motion"
import {
  Activity,
  Brain,
  Heart,
  MessageCircle,
  Sparkles,
  Target,
} from "lucide-react"
import type { InterviewScores, LiveFeedback } from "../types"
import { ScoreCards } from "./ScoreCards"

interface InterviewAnalyticsPanelProps {
  scores: InterviewScores | null
  liveFeedback: LiveFeedback | null
  role?: "candidate" | "recruiter"
}

const pulseMetrics = [
  { key: "confidence_score", label: "Confianza", icon: Target, color: "#F59E0B" },
  { key: "authenticity_score", label: "Autenticidad", icon: Heart, color: "#EC4899" },
] as const

function engagementFromScores(scores: InterviewScores | null): number {
  if (!scores?.dimensions) return scores?.overall_score ?? 0
  const d = scores.dimensions
  const vals = [
    d.communication,
    d.vocal_confidence,
    d.eye_contact,
    d.cultural_fit,
  ].filter((v): v is number => typeof v === "number")
  if (!vals.length) return scores.overall_score ?? 0
  return vals.reduce((a, b) => a + b, 0) / vals.length
}

export function InterviewAnalyticsPanel({
  scores,
  liveFeedback,
  role = "candidate",
}: InterviewAnalyticsPanelProps) {
  const engagement = engagementFromScores(scores)
  const communication =
    scores?.dimensions?.communication ?? scores?.content_score ?? 0
  const responseQuality = scores?.dimensions?.reasoning ?? scores?.skill_match_pct ?? 0

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-[#7C3AED]" />
        <h2 className="font-display text-lg font-semibold">
          {role === "recruiter" ? "Panel reclutador" : "Análisis en vivo"}
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {[
          {
            label: "Comunicación",
            value: communication,
            icon: MessageCircle,
            color: "#06B6D4",
          },
          {
            label: "Engagement",
            value: engagement,
            icon: Activity,
            color: "#10B981",
          },
          {
            label: "Calidad respuesta",
            value: responseQuality,
            icon: Brain,
            color: "#7C3AED",
          },
          {
            label: "Score global",
            value: scores?.overall_score ?? 0,
            icon: Target,
            color: "#9F67FF",
          },
        ].map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-xl border border-white/10 bg-white/[0.03] p-3 backdrop-blur-md"
          >
            <div className="flex items-center gap-2">
              <m.icon className="h-3.5 w-3.5" style={{ color: m.color }} />
              <span className="text-[10px] text-[#64748B]">{m.label}</span>
            </div>
            <p className="mt-1 font-display text-xl font-semibold" style={{ color: m.color }}>
              {Math.round(m.value)}%
            </p>
            <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/10">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: m.color }}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, m.value)}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </motion.div>
        ))}
      </div>

      {scores && (
        <div className="grid grid-cols-2 gap-2">
          {pulseMetrics.map((m) => {
            const val = scores[m.key as keyof InterviewScores] as number
            return (
              <div
                key={m.key}
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2"
              >
                <m.icon className="h-4 w-4" style={{ color: m.color }} />
                <div>
                  <p className="text-[10px] text-[#64748B]">{m.label}</p>
                  <p className="text-sm font-semibold text-white">{Math.round(val)}%</p>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {liveFeedback?.communication_note && (
        <p className="rounded-xl border border-[#06B6D4]/25 bg-[#06B6D4]/10 px-3 py-2 text-xs text-[#A5F3FC]">
          {liveFeedback.communication_note}
        </p>
      )}

      <ScoreCards scores={scores} />
    </div>
  )
}
