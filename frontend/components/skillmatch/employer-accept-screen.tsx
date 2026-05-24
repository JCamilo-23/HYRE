"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Clock,
  UserCheck,
  XCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Screen } from "@/lib/hyre-types"
import { EMPLOYER_CANDIDATES, EmployerCandidate } from "@/lib/employer-mock-data"

interface EmployerAcceptScreenProps {
  onNavigate: (screen: Screen) => void
}

export function EmployerAcceptScreen({ onNavigate }: EmployerAcceptScreenProps) {
  const [candidates, setCandidates] = useState(EMPLOYER_CANDIDATES)
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [recentAction, setRecentAction] = useState<string | null>(null)

  const pending = candidates.filter((c) => c.status === "pending")

  const handleDecision = (id: number, status: "accepted" | "rejected") => {
    const candidate = candidates.find((c) => c.id === id)
    setCandidates((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status } : c))
    )
    setExpandedId(null)
    setRecentAction(
      status === "accepted"
        ? `${candidate?.name} aceptado/a`
        : `${candidate?.name} rechazado/a`
    )
    setTimeout(() => setRecentAction(null), 3000)
  }

  return (
    <div className="min-h-screen pb-24 safe-area-top">
      <div className="px-6 pt-6 pb-4">
        <h1 className="text-2xl font-semibold text-[#F1F5F9] mb-1">Aceptar candidatos</h1>
        <p className="text-[#94A3B8] text-sm">
          Revisa los reportes IA y decide quien avanza en tu proceso
        </p>
      </div>

      <AnimatePresence>
        {recentAction && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mx-6 mb-4 px-4 py-3 rounded-xl bg-[#10B981]/20 border border-[#10B981]/30 text-[#10B981] text-sm font-medium text-center"
          >
            {recentAction}
          </motion.div>
        )}
      </AnimatePresence>

      {pending.length === 0 ? (
        <div className="px-6">
          <div className="glass rounded-2xl p-8 text-center">
            <CheckCircle className="w-12 h-12 text-[#10B981] mx-auto mb-3" />
            <p className="text-[#F1F5F9] font-medium mb-1">No hay candidatos pendientes</p>
            <p className="text-[#94A3B8] text-sm mb-4">
              Revisa el historial en Reportes o espera nuevas evaluaciones
            </p>
            <Button
              onClick={() => onNavigate("employerReports")}
              className="h-11 px-6"
              style={{ background: "linear-gradient(135deg, #06B6D4, #7C3AED)", color: "#F1F5F9" }}
            >
              Ver reportes
            </Button>
          </div>
        </div>
      ) : (
        <div className="px-6 flex flex-col gap-3">
          {pending.map((candidate, index) => (
            <CandidateCard
              key={candidate.id}
              candidate={candidate}
              index={index}
              expanded={expandedId === candidate.id}
              onToggle={() =>
                setExpandedId(expandedId === candidate.id ? null : candidate.id)
              }
              onAccept={() => handleDecision(candidate.id, "accepted")}
              onReject={() => handleDecision(candidate.id, "rejected")}
              onViewReport={() => onNavigate("employerReports")}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function CandidateCard({
  candidate,
  index,
  expanded,
  onToggle,
  onAccept,
  onReject,
  onViewReport,
}: {
  candidate: EmployerCandidate
  index: number
  expanded: boolean
  onToggle: () => void
  onAccept: () => void
  onReject: () => void
  onViewReport: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="glass rounded-2xl overflow-hidden border border-[#06B6D4]/10"
    >
      <button onClick={onToggle} className="w-full p-4 text-left">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold text-[#F1F5F9] shrink-0"
            style={{ backgroundColor: candidate.color }}
          >
            {candidate.initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[#F1F5F9] font-medium truncate">{candidate.name}</p>
              <span className="text-[#10B981] font-bold text-sm shrink-0">
                {candidate.score}%
              </span>
            </div>
            <p className="text-[#94A3B8] text-sm">{candidate.role}</p>
            <div className="flex items-center gap-3 mt-1 text-[#475569] text-xs">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {candidate.evaluatedAt}
              </span>
              <span>{candidate.match}% match</span>
            </div>
          </div>
          <ChevronDown
            className={`w-5 h-5 text-[#94A3B8] shrink-0 transition-transform ${
              expanded ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t border-[rgba(255,255,255,0.06)]">
              <p className="text-[#94A3B8] text-sm mt-3 mb-3 leading-relaxed">
                {candidate.summary}
              </p>

              <div className="grid grid-cols-3 gap-2 mb-3">
                {candidate.categories.map((cat) => (
                  <div key={cat.label} className="bg-[#1A1A2E] rounded-lg p-2 text-center">
                    <p className="text-[#F1F5F9] font-bold text-sm">{cat.score}</p>
                    <p className="text-[#475569] text-[10px]">{cat.label}</p>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-1.5 mb-4">
                {candidate.highlights.map((h) => (
                  <span
                    key={h}
                    className="px-2 py-0.5 rounded-md bg-[#06B6D4]/15 text-[#06B6D4] text-xs"
                  >
                    {h}
                  </span>
                ))}
              </div>

              <button
                onClick={onViewReport}
                className="w-full flex items-center justify-between p-3 mb-3 rounded-xl bg-[#1A1A2E] hover:bg-[#1A1A2E]/80 transition-colors"
              >
                <span className="text-[#94A3B8] text-sm">Ver reporte completo</span>
                <ChevronRight className="w-4 h-4 text-[#06B6D4]" />
              </button>

              <div className="flex gap-2">
                <Button
                  onClick={onReject}
                  variant="outline"
                  className="flex-1 h-11 glass text-[#EF4444] border-[#EF4444]/30 hover:bg-[#EF4444]/10"
                >
                  <XCircle className="w-4 h-4 mr-1.5" />
                  Rechazar
                </Button>
                <Button
                  onClick={onAccept}
                  className="flex-1 h-11"
                  style={{ background: "linear-gradient(135deg, #10B981, #06B6D4)", color: "#F1F5F9" }}
                >
                  <UserCheck className="w-4 h-4 mr-1.5" />
                  Aceptar
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
