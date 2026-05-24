"use client"

import { motion } from "framer-motion"
import { FileText, CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import type { InterviewReport, InterviewScores } from "../types"

const REC_STYLES: Record<string, string> = {
  strong_hire: "text-[#10B981]",
  hire: "text-[#34D399]",
  maybe: "text-[#FBBF24]",
  no_hire: "text-[#F87171]",
}

interface InterviewReportPanelProps {
  sessionId: string
  scores: InterviewScores | null
  report: InterviewReport | null
  loading?: boolean
}

export function InterviewReportPanel({
  sessionId,
  scores,
  report,
  loading = false,
}: InterviewReportPanelProps) {
  const rec = scores?.recommendation ?? "maybe"
  const recClass = REC_STYLES[rec] ?? "text-white"

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0614]/90 p-4 backdrop-blur-md"
    >
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-[#7C3AED]/30 bg-gradient-to-b from-[#1a1030] to-[#0a0614] p-6 shadow-2xl shadow-[#7C3AED]/20">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#7C3AED]/25">
            <FileText className="h-6 w-6 text-[#C4B5FD]" />
          </div>
          <div>
            <h2 className="font-display text-xl font-semibold text-white">
              Informe de entrevista HYRE
            </h2>
            <p className="text-xs text-[#64748B] font-mono truncate max-w-[280px]">{sessionId}</p>
          </div>
        </div>

        {loading && (
          <p className="mt-6 text-sm text-[#94A3B8]">Generando informe ejecutivo con IA…</p>
        )}

        {scores && (
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Score global", value: scores.overall_score },
              { label: "Contratación", value: scores.hire_probability },
              { label: "Skills", value: scores.skill_match_pct },
              { label: "Confianza", value: scores.confidence_score },
            ].map((m) => (
              <div
                key={m.label}
                className="rounded-xl border border-white/10 bg-white/5 p-3 text-center"
              >
                <p className="text-[10px] uppercase text-[#64748B]">{m.label}</p>
                <p className="font-display text-xl font-semibold text-white">
                  {Math.round(m.value)}%
                </p>
              </div>
            ))}
          </div>
        )}

        <p className={`mt-4 font-display text-lg font-semibold capitalize ${recClass}`}>
          {report?.overall_verdict ?? rec.replace(/_/g, " ")}
        </p>

        {report && (
          <div className="mt-4 space-y-4 text-sm text-[#CBD5E1]">
            {report.executive_summary && (
              <section>
                <h3 className="text-xs font-medium uppercase text-[#7C3AED]">Resumen ejecutivo</h3>
                <p className="mt-1 leading-relaxed">{report.executive_summary}</p>
              </section>
            )}
            {report.recommendation_narrative && (
              <section>
                <h3 className="text-xs font-medium uppercase text-[#06B6D4]">Recomendación</h3>
                <p className="mt-1 leading-relaxed">{report.recommendation_narrative}</p>
              </section>
            )}
            {report.strengths.length > 0 && (
              <section>
                <h3 className="flex items-center gap-1 text-xs font-medium uppercase text-[#10B981]">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Fortalezas
                </h3>
                <ul className="mt-1 list-inside list-disc space-y-1">
                  {report.strengths.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </section>
            )}
            {report.areas_for_improvement.length > 0 && (
              <section>
                <h3 className="flex items-center gap-1 text-xs font-medium uppercase text-[#FBBF24]">
                  <AlertTriangle className="h-3.5 w-3.5" /> Áreas de mejora
                </h3>
                <ul className="mt-1 list-inside list-disc space-y-1">
                  {report.areas_for_improvement.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </section>
            )}
            {report.next_steps && (
              <section className="rounded-xl border border-white/10 bg-white/5 p-3">
                <h3 className="text-xs font-medium uppercase text-[#94A3B8]">Próximos pasos</h3>
                <p className="mt-1">{report.next_steps}</p>
              </section>
            )}
          </div>
        )}

        <div className="mt-8 flex flex-col gap-2 sm:flex-row">
          <Button asChild className="flex-1 rounded-full bg-gradient-to-r from-[#7C3AED] to-[#9F67FF]">
            <Link href="/interview">
              Nueva entrevista
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" className="flex-1 rounded-full border-white/15">
            <Link href="/">Volver al inicio</Link>
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
