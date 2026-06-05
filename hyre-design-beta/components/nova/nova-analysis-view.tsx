"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import type { NovaAnalysis } from "@/modules/nova/types"

interface NovaAnalysisViewProps {
  analysis: NovaAnalysis
}

type Tab = "actions" | "weaknesses" | "ats" | "keywords" | "bullets" | "strengths"

const TABS: { id: Tab; label: string }[] = [
  { id: "actions", label: "Acciones" },
  { id: "weaknesses", label: "Debilidades" },
  { id: "ats", label: "ATS" },
  { id: "keywords", label: "Keywords" },
  { id: "bullets", label: "Bullets" },
  { id: "strengths", label: "Fortalezas" },
]

const IMPACT_COLORS: Record<string, string> = {
  critical: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  high: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  medium: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  low: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
}

const IMPORTANCE_COLORS: Record<string, string> = {
  critical: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  important: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
  nice_to_have: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
}

export function NovaAnalysisView({ analysis }: NovaAnalysisViewProps) {
  const [tab, setTab] = useState<Tab>("actions")

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
      {/* Summary */}
      {analysis.feedback_summary && (
        <div className="p-5 bg-violet-50 dark:bg-violet-950/20 border-b border-violet-100 dark:border-violet-900/30">
          <p className="text-sm leading-relaxed text-violet-900 dark:text-violet-200">
            {analysis.feedback_summary}
          </p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex overflow-x-auto border-b border-zinc-200 dark:border-zinc-800">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`shrink-0 px-4 py-3 text-sm font-medium transition-colors ${
              tab === t.id
                ? "text-violet-600 border-b-2 border-violet-600"
                : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.15 }}
          className="p-5 space-y-4 max-h-[480px] overflow-y-auto"
        >
          {tab === "actions" && (
            <>
              {analysis.top_actions.map((a) => (
                <div key={a.priority} className="flex gap-3">
                  <div className="w-7 h-7 rounded-lg bg-violet-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                    {a.priority}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">{a.action}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">{a.impact}</p>
                    <span className="inline-block mt-1 text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-2 py-0.5 rounded-full">
                      {a.time_estimate}
                    </span>
                  </div>
                </div>
              ))}
            </>
          )}

          {tab === "weaknesses" && (
            <>
              {analysis.weaknesses.map((w, i) => (
                <div key={i} className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${IMPACT_COLORS[w.impact]}`}>
                      {w.impact}
                    </span>
                    <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">{w.category}</span>
                  </div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">{w.description}</p>
                  {w.evidence && (
                    <p className="mt-2 text-xs text-zinc-500 italic">"{w.evidence}"</p>
                  )}
                </div>
              ))}
              {analysis.weaknesses.length === 0 && (
                <p className="text-sm text-zinc-500 text-center py-4">Sin debilidades detectadas</p>
              )}
            </>
          )}

          {tab === "ats" && (
            <>
              {/* Sections */}
              <div className="flex gap-4 mb-4">
                <div>
                  <p className="text-xs text-zinc-500 mb-1">Secciones detectadas</p>
                  <div className="flex flex-wrap gap-1.5">
                    {analysis.sections_detected.map((s) => (
                      <span key={s} className="text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-2 py-0.5 rounded-full">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 mb-1">Secciones faltantes</p>
                  <div className="flex flex-wrap gap-1.5">
                    {analysis.sections_missing.map((s) => (
                      <span key={s} className="text-xs bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 px-2 py-0.5 rounded-full">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {analysis.ats_issues.map((issue, i) => (
                <div key={i} className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
                  <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100 mb-1">{issue.issue}</p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">{issue.description}</p>
                  <p className="mt-2 text-sm text-violet-700 dark:text-violet-300 font-medium">→ {issue.fix}</p>
                </div>
              ))}
              {analysis.ats_issues.length === 0 && (
                <p className="text-sm text-emerald-600 text-center py-4">No se detectaron problemas ATS</p>
              )}
            </>
          )}

          {tab === "keywords" && (
            <>
              {analysis.keyword_gaps.map((kw, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${IMPORTANCE_COLORS[kw.importance]}`}>
                    {kw.importance.replace("_", " ")}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">{kw.keyword}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">{kw.context}</p>
                  </div>
                </div>
              ))}
              {analysis.keyword_gaps.length === 0 && (
                <p className="text-sm text-emerald-600 text-center py-4">No faltan keywords críticas</p>
              )}
            </>
          )}

          {tab === "bullets" && (
            <>
              {analysis.bullets_analysis.map((b, i) => (
                <div key={i} className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 space-y-2">
                  <div>
                    <p className="text-xs text-zinc-400 mb-0.5">Original</p>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 line-through">{b.original}</p>
                  </div>
                  <div>
                    <p className="text-xs text-amber-500 mb-0.5">Problema</p>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">{b.problem}</p>
                  </div>
                  <div>
                    <p className="text-xs text-emerald-500 mb-0.5">Sugerido</p>
                    <p className="text-sm font-medium text-zinc-800 dark:text-zinc-100">{b.suggested}</p>
                  </div>
                </div>
              ))}
              {analysis.bullets_analysis.length === 0 && (
                <p className="text-sm text-zinc-500 text-center py-4">No hay bullets para mejorar</p>
              )}
            </>
          )}

          {tab === "strengths" && (
            <>
              {analysis.strengths.map((s, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">{s.category}</p>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">{s.description}</p>
                    {s.evidence && (
                      <p className="mt-1 text-xs text-zinc-500 italic">"{s.evidence}"</p>
                    )}
                  </div>
                </div>
              ))}
              {analysis.strengths.length === 0 && (
                <p className="text-sm text-zinc-500 text-center py-4">Sin fortalezas detectadas</p>
              )}
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
