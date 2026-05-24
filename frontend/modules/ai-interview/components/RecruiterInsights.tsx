"use client"

import { motion, AnimatePresence } from "framer-motion"
import type { InterviewScores, InterviewWsEvent } from "../types"

import type { CultureFitInsights } from "../types"

interface RecruiterInsightsProps {
  cultureInsights?: CultureFitInsights | null
  personalityProfile?: string | null
  agentDisplayName?: string | null
  scores: InterviewScores | null
  events: InterviewWsEvent[]
  sessionId: string
}

const REC_LABELS: Record<string, string> = {
  strong_hire: "Contratación fuerte",
  hire: "Recomendado",
  maybe: "En evaluación",
  no_hire: "No recomendado",
}

export function RecruiterInsights({ scores, events, sessionId, cultureInsights, personalityProfile, agentDisplayName }: RecruiterInsightsProps) {
  const recent = events.filter((e) => e.type?.startsWith("analysis")).slice(-5)

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        {agentDisplayName && (
        <p className="mb-2 text-xs text-[#C4B5FD]">Reclutador IA: {agentDisplayName}</p>
      )}
      <p className="text-xs text-[#94A3B8]">Sesión</p>
        <p className="mt-1 truncate font-mono text-xs text-[#C4B5FD]">{sessionId}</p>
      </div>

      
      {cultureInsights && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-2xl border border-[#06B6D4]/25 bg-[#06B6D4]/10 p-4"
        >
          <p className="text-xs font-medium uppercase text-[#06B6D4]">Culture Fit Intelligence</p>
          {personalityProfile && (
            <p className="mt-1 text-sm font-medium text-white">{personalityProfile}</p>
          )}
          {cultureInsights.psychological_summary && (
            <p className="mt-2 text-xs text-[#94A3B8]">{cultureInsights.psychological_summary}</p>
          )}
          <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
            <span>Startup fit: {Math.round(cultureInsights.startup_fit_score ?? 0)}%</span>
            <span>Alineación: {Math.round(cultureInsights.cultural_alignment_score ?? 0)}%</span>
          </div>
        </motion.div>
      )}

      {scores && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-2xl border border-[#7C3AED]/30 bg-gradient-to-br from-[#7C3AED]/20 to-transparent p-4"
        >
          <p className="text-xs text-[#C4B5FD]">Recomendación IA</p>
          <p className="mt-1 font-display text-xl font-semibold">
            {REC_LABELS[scores.recommendation] ?? scores.recommendation}
          </p>
          <p className="mt-2 text-sm text-[#94A3B8]">
            Probabilidad de contratación:{" "}
            <span className="text-white">{scores.hire_probability}%</span>
          </p>
          {(scores.red_flags?.length ?? 0) > 0 && (
            <ul className="mt-3 space-y-1 text-xs text-[#F87171]">
              {(scores.red_flags ?? []).slice(0, 4).map((f) => (
                <li key={f}>• {f}</li>
              ))}
            </ul>
          )}
        </motion.div>
      )}

      <div>
        <h3 className="mb-2 text-sm font-medium text-[#94A3B8]">Eventos en vivo</h3>
        <AnimatePresence mode="popLayout">
          {recent.length === 0 ? (
            <p className="text-xs text-[#64748B]">Esperando análisis del candidato…</p>
          ) : (
            recent.map((ev, i) => (
              <motion.div
                key={`${ev.type}-${i}`}
                layout
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-2 rounded-xl border border-white/5 bg-black/30 px-3 py-2 text-xs"
              >
                <span className="text-[#06B6D4]">{ev.type}</span>
                {"latency_ms" in ev && typeof ev.latency_ms === "number" && (
                  <span className="ml-2 text-[#64748B]">{ev.latency_ms}ms</span>
                )}
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
