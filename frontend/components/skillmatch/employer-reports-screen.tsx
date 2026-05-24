"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Award,
  BarChart3,
  Brain,
  ChevronRight,
  MessageSquare,
  Target,
  TrendingUp,
  Users,
} from "lucide-react"
import { Screen } from "@/lib/hyre-types"
import { EMPLOYER_CANDIDATES, EmployerCandidate } from "@/lib/employer-mock-data"

interface EmployerReportsScreenProps {
  onNavigate: (screen: Screen) => void
}

const categoryIcons: Record<string, typeof MessageSquare> = {
  Comunicacion: MessageSquare,
  Tecnico: Brain,
  Cultura: Users,
}

export function EmployerReportsScreen({ onNavigate }: EmployerReportsScreenProps) {
  const [selected, setSelected] = useState<EmployerCandidate | null>(null)

  if (selected) {
    return (
      <EmployerReportDetail
        candidate={selected}
        onBack={() => setSelected(null)}
        onNavigate={onNavigate}
      />
    )
  }

  return (
    <div className="min-h-screen pb-24 safe-area-top">
      <div className="px-6 pt-6 pb-4">
        <h1 className="text-2xl font-semibold text-[#F1F5F9] mb-1">Reportes IA</h1>
        <p className="text-[#94A3B8] text-sm">
          Evaluaciones completas de candidatos para tu vacante
        </p>
      </div>

      <div className="px-6 flex flex-col gap-3">
        {EMPLOYER_CANDIDATES.map((candidate, index) => (
          <motion.button
            key={candidate.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
            onClick={() => setSelected(candidate)}
            className="glass rounded-xl p-4 text-left hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold text-[#F1F5F9] shrink-0"
                style={{ backgroundColor: candidate.color }}
              >
                {candidate.initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-[#F1F5F9] font-medium">{candidate.name}</p>
                  <span
                    className="text-lg font-bold"
                    style={{
                      color:
                        candidate.score >= 85
                          ? "#10B981"
                          : candidate.score >= 70
                            ? "#06B6D4"
                            : "#F59E0B",
                    }}
                  >
                    {candidate.score}
                  </span>
                </div>
                <p className="text-[#94A3B8] text-sm">{candidate.role}</p>
                <div className="flex items-center justify-between mt-2">
                  <StatusBadge status={candidate.status} />
                  <span className="text-[#475569] text-xs">{candidate.evaluatedAt}</span>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-[#475569] shrink-0" />
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: EmployerCandidate["status"] }) {
  const config = {
    pending: { label: "Pendiente", color: "#F59E0B", bg: "#F59E0B20" },
    accepted: { label: "Aceptado", color: "#10B981", bg: "#10B98120" },
    rejected: { label: "Rechazado", color: "#EF4444", bg: "#EF444420" },
  }[status]

  return (
    <span
      className="px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ color: config.color, backgroundColor: config.bg }}
    >
      {config.label}
    </span>
  )
}

function EmployerReportDetail({
  candidate,
  onBack,
  onNavigate,
}: {
  candidate: EmployerCandidate
  onBack: () => void
  onNavigate: (screen: Screen) => void
}) {
  return (
    <div className="min-h-screen pb-24 safe-area-top">
      <div className="px-6 pt-6 pb-4">
        <button
          onClick={onBack}
          className="text-[#94A3B8] text-sm mb-4 hover:text-[#F1F5F9] transition-colors"
        >
          ← Volver a reportes
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center text-lg font-bold text-[#F1F5F9]"
            style={{ backgroundColor: candidate.color }}
          >
            {candidate.initials}
          </div>
          <div>
            <h1 className="text-xl font-semibold text-[#F1F5F9]">{candidate.name}</h1>
            <p className="text-[#94A3B8] text-sm">{candidate.role}</p>
          </div>
        </div>
      </div>

      <div className="px-6 mb-6">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="glass rounded-2xl p-6 text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#06B6D4]/15 to-transparent" />
          <div className="relative">
            <BarChart3 className="w-8 h-8 text-[#06B6D4] mx-auto mb-2" />
            <div className="text-5xl font-bold text-[#10B981] mb-1">{candidate.score}</div>
            <p className="text-[#94A3B8] text-sm">Score general IA</p>
            <div className="mt-3 px-3 py-1.5 bg-[#10B981]/10 rounded-lg inline-block">
              <p className="text-[#10B981] text-xs font-medium">
                {candidate.match}% compatibilidad con tu vacante
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="px-6 mb-6">
        <h2 className="text-[#F1F5F9] font-medium mb-3">Desglose por categoria</h2>
        <div className="space-y-3">
          {candidate.categories.map((cat, index) => {
            const Icon = categoryIcons[cat.label] ?? Target
            return (
              <motion.div
                key={cat.label}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass rounded-xl p-4"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 rounded-lg bg-[#06B6D4]/20 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-[#06B6D4]" />
                  </div>
                  <p className="text-[#F1F5F9] text-sm flex-1">{cat.label}</p>
                  <span className="text-[#F1F5F9] font-bold">{cat.score}</span>
                </div>
                <div className="h-1.5 bg-[#1A1A2E] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${cat.score}%` }}
                    transition={{ duration: 0.8, delay: 0.3 + index * 0.1 }}
                    className="h-full bg-[#06B6D4] rounded-full"
                  />
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      <div className="px-6 mb-6">
        <h2 className="text-[#F1F5F9] font-medium mb-3">Resumen de la IA</h2>
        <div className="glass rounded-xl p-4">
          <p className="text-[#94A3B8] text-sm leading-relaxed mb-3">{candidate.summary}</p>
          <div className="flex flex-wrap gap-2">
            {candidate.highlights.map((h) => (
              <span
                key={h}
                className="px-2.5 py-1 rounded-full bg-[#7C3AED]/20 text-[#7C3AED] text-xs"
              >
                {h}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="px-6 mb-6">
        <h2 className="text-[#F1F5F9] font-medium mb-3">Habilidades evaluadas</h2>
        <div className="flex flex-wrap gap-2">
          {candidate.skills.map((skill) => (
            <span
              key={skill}
              className="px-3 py-1.5 rounded-lg bg-[#1A1A2E] text-[#94A3B8] text-sm flex items-center gap-1.5"
            >
              <Award className="w-3.5 h-3.5 text-[#F59E0B]" />
              {skill}
            </span>
          ))}
        </div>
      </div>

      {candidate.status === "pending" && (
        <div className="px-6">
          <button
            onClick={() => onNavigate("employerAccept")}
            className="w-full h-12 rounded-xl font-medium text-[#F1F5F9] flex items-center justify-center gap-2"
            style={{ background: "linear-gradient(135deg, #06B6D4, #7C3AED)" }}
          >
            <TrendingUp className="w-4 h-4" />
            Ir a aceptar candidato
          </button>
        </div>
      )}
    </div>
  )
}
