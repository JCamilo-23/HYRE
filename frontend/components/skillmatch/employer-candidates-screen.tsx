"use client"

import { useEffect, useMemo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Award,
  BarChart3,
  Brain,
  ChevronRight,
  Clock,
  Loader2,
  MessageSquare,
  Target,
  UserCheck,
  Users,
  XCircle,
  Briefcase,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { EMPLOYER_CANDIDATES, EmployerCandidate } from "@/lib/employer-mock-data"

type Filter = "all" | "pending" | "accepted" | "rejected"

const FILTERS: { id: Filter; label: string }[] = [
  { id: "pending", label: "Pendientes" },
  { id: "all", label: "Todos" },
  { id: "accepted", label: "Aceptados" },
  { id: "rejected", label: "Rechazados" },
]

const categoryIcons: Record<string, typeof MessageSquare> = {
  Comunicacion: MessageSquare,
  Tecnico: Brain,
  Cultura: Users,
}

export function EmployerCandidatesScreen() {
  const [candidates, setCandidates] = useState<EmployerCandidate[]>(EMPLOYER_CANDIDATES)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<Filter>("pending")
  const [selected, setSelected] = useState<EmployerCandidate | null>(null)
  const [recentAction, setRecentAction] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/employer/candidates")
      .then((r) => r.json())
      .then((data: EmployerCandidate[]) => {
        if (Array.isArray(data) && data.length > 0) setCandidates(data)
      })
      .catch(() => {/* mantiene mock data si falla */})
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    if (filter === "all") return candidates
    return candidates.filter((c) => c.status === filter)
  }, [candidates, filter])

  const handleDecision = async (id: string, status: "accepted" | "rejected") => {
    const candidate = candidates.find((c) => c.id === id)

    // Optimistic update
    setCandidates((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)))
    setSelected((prev) => (prev?.id === id ? { ...prev, status } : prev))
    setRecentAction(
      status === "accepted"
        ? `${candidate?.name} aceptado/a`
        : `${candidate?.name} rechazado/a`
    )
    setTimeout(() => setRecentAction(null), 3000)

    // Persist + notify (solo para candidatos reales, no mock)
    if (candidate?.matchId && !candidate.matchId.startsWith("mock-")) {
      await fetch(`/api/employer/candidates/${candidate.matchId}/decision`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
    }
  }

  if (selected) {
    return (
      <CandidateReportDetail
        candidate={selected}
        onBack={() => setSelected(null)}
        onAccept={() => handleDecision(selected.id, "accepted")}
        onReject={() => handleDecision(selected.id, "rejected")}
      />
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#7C3AED] animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-24 safe-area-top">
      <div className="px-6 pt-6 pb-4">
        <h1 className="text-2xl font-semibold text-[#F1F5F9] mb-1">Reportes y candidatos</h1>
        <p className="text-[#94A3B8] text-sm">
          Revisa evaluaciones IA y acepta quienes encajen con tu vacante
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

      <div className="px-6 mb-4 flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className="px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all"
            style={{
              backgroundColor: filter === f.id ? "#06B6D433" : "#1A1A2E",
              color: filter === f.id ? "#06B6D4" : "#94A3B8",
              border: `1px solid ${filter === f.id ? "#06B6D4" : "rgba(255,255,255,0.1)"}`,
            }}
          >
            {f.label}
            {f.id !== "all" && (
              <span className="ml-1 opacity-70">
                ({candidates.filter((c) => c.status === f.id).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="px-6">
          <div className="glass rounded-2xl p-8 text-center">
            <BarChart3 className="w-12 h-12 text-[#475569] mx-auto mb-3" />
            <p className="text-[#F1F5F9] font-medium mb-1">Sin candidatos en esta categoria</p>
            <p className="text-[#94A3B8] text-sm">
              Prueba otro filtro o espera nuevas evaluaciones
            </p>
          </div>
        </div>
      ) : (
        <div className="px-6 flex flex-col gap-3">
          {filtered.map((candidate, index) => (
            <motion.button
              key={candidate.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06 }}
              onClick={() => setSelected(candidate)}
              className="glass rounded-xl p-4 text-left hover:bg-white/5 transition-colors w-full"
            >
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
                    <span
                      className="text-lg font-bold shrink-0"
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
                    <div className="flex items-center gap-2">
                      <StatusBadge status={candidate.status} />
                      {candidate.simulation && (
                        <SimulationBadge
                          score={candidate.simulation.score}
                          passed={candidate.simulation.passed}
                        />
                      )}
                    </div>
                    <span className="text-[#475569] text-xs flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {candidate.evaluatedAt}
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-[#475569] shrink-0" />
              </div>
            </motion.button>
          ))}
        </div>
      )}
    </div>
  )
}

function SimulationBadge({ score, passed }: { score: number; passed: boolean }) {
  return (
    <span
      className="px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1"
      style={{
        color: passed ? "#10B981" : "#F59E0B",
        backgroundColor: passed ? "#10B98120" : "#F59E0B20",
      }}
    >
      <Briefcase className="w-3 h-3" />
      Simuló · {score}
    </span>
  )
}

function SimulationSection({ simulation }: { simulation: NonNullable<EmployerCandidate["simulation"]> }) {
  const qualityColors: Record<string, string> = {
    excelente:   "#10B981",
    bueno:       "#06B6D4",
    aceptable:   "#F59E0B",
    insuficiente: "#EF4444",
  }
  const color = qualityColors[simulation.quality] ?? "#94A3B8"

  return (
    <div className="px-6 mb-6">
      <h2 className="text-[#F1F5F9] font-medium mb-3 flex items-center gap-2">
        <Briefcase className="w-4 h-4 text-[#7C3AED]" />
        Simulación laboral
      </h2>

      {/* Score card */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="glass rounded-2xl p-5 mb-3 flex items-center gap-4"
        style={{ borderColor: `${color}40`, borderWidth: 1 }}
      >
        <div
          className="w-16 h-16 rounded-xl flex flex-col items-center justify-center shrink-0"
          style={{ backgroundColor: `${color}15` }}
        >
          <span className="text-2xl font-bold" style={{ color }}>{simulation.score}</span>
          <span className="text-xs" style={{ color }}>/ 100</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {simulation.passed ? (
              <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-[#F59E0B] shrink-0" />
            )}
            <span className="text-[#F1F5F9] font-medium text-sm">
              {simulation.passed ? "Aprobó la simulación" : "No alcanzó el mínimo"}
            </span>
          </div>
          <span
            className="px-2 py-0.5 rounded-full text-xs font-medium capitalize"
            style={{ color, backgroundColor: `${color}20` }}
          >
            {simulation.quality}
          </span>
          <p className="text-[#475569] text-xs mt-1.5 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {simulation.completedAt}
          </p>
        </div>
      </motion.div>

      {/* Feedback */}
      <div className="glass rounded-xl p-4 mb-3">
        <p className="text-[#94A3B8] text-sm leading-relaxed">{simulation.feedback}</p>
      </div>

      {/* Fortalezas */}
      <div className="glass rounded-xl p-4 mb-3">
        <p className="text-[#F1F5F9] text-xs font-medium mb-2 flex items-center gap-1.5">
          <TrendingUp className="w-3.5 h-3.5 text-[#10B981]" />
          Fortalezas demostradas
        </p>
        <div className="flex flex-col gap-1.5">
          {simulation.strengths.map((s) => (
            <div key={s} className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] shrink-0 mt-0.5" />
              <span className="text-[#94A3B8] text-sm">{s}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Áreas de mejora */}
      {simulation.improvements.length > 0 && (
        <div className="glass rounded-xl p-4">
          <p className="text-[#F1F5F9] text-xs font-medium mb-2 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-[#F59E0B]" />
            Áreas de mejora
          </p>
          <div className="flex flex-col gap-1.5">
            {simulation.improvements.map((s) => (
              <div key={s} className="flex items-start gap-2">
                <span className="text-[#F59E0B] text-xs mt-0.5">•</span>
                <span className="text-[#94A3B8] text-sm">{s}</span>
              </div>
            ))}
          </div>
        </div>
      )}
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

function CandidateReportDetail({
  candidate,
  onBack,
  onAccept,
  onReject,
}: {
  candidate: EmployerCandidate
  onBack: () => void
  onAccept: () => void
  onReject: () => void
}) {
  const isPending = candidate.status === "pending"

  return (
    <div className="min-h-screen pb-24 safe-area-top">
      <div className="px-6 pt-6 pb-4">
        <button
          onClick={onBack}
          className="text-[#94A3B8] text-sm mb-4 hover:text-[#F1F5F9] transition-colors"
        >
          ← Volver
        </button>

        <div className="flex items-center gap-3 mb-2">
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
        <StatusBadge status={candidate.status} />
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

      {candidate.simulation ? (
        <SimulationSection simulation={candidate.simulation} />
      ) : (
        <div className="px-6 mb-6">
          <div className="glass rounded-xl p-4 flex items-center gap-3">
            <Briefcase className="w-5 h-5 text-[#475569] shrink-0" />
            <p className="text-[#475569] text-sm">
              Este candidato aún no completó la simulación laboral para esta vacante.
            </p>
          </div>
        </div>
      )}

      {isPending && (
        <div className="px-6 flex gap-2">
          <Button
            onClick={onReject}
            variant="outline"
            className="flex-1 h-12 glass text-[#EF4444] border-[#EF4444]/30 hover:bg-[#EF4444]/10"
          >
            <XCircle className="w-4 h-4 mr-1.5" />
            Rechazar
          </Button>
          <Button
            onClick={onAccept}
            className="flex-1 h-12"
            style={{ background: "linear-gradient(135deg, #10B981, #06B6D4)", color: "#F1F5F9" }}
          >
            <UserCheck className="w-4 h-4 mr-1.5" />
            Aceptar
          </Button>
        </div>
      )}
    </div>
  )
}
