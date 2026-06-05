"use client"

import { motion } from "framer-motion"
import {
  Sparkles,
  Target,
  Video,
  ChevronRight,
  Zap,
  Trophy,
  TrendingUp,
  FileText,
} from "lucide-react"
import { useEffect } from "react"
import { Screen, UserData } from "@/lib/hyre-types"
import { TaskNotificationBell } from "@/components/notifications/task-notification-bell"
import { useTaskNotificationsStore } from "@/store/task-notifications-store"
import { WORK_DAY_NOTIFICATION_SLOTS } from "@/modules/work-simulator/constants"
import { useCandidateStats } from "@/modules/stats/hooks"

interface HomeScreenProps {
  onNavigate: (screen: Screen) => void
  userData: UserData
}

const LEVEL_NAMES: Record<number, string> = {
  1: "Newcomer",
  2: "Explorer",
  3: "Rising Star",
  4: "Pro",
  5: "Expert",
  6: "Master",
  7: "Legend",
}

const JOB_COLORS = ["#7C3AED", "#06B6D4", "#10B981", "#F59E0B", "#EF4444"]

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-white/10 rounded ${className}`} />
}

export function HomeScreen({ onNavigate, userData }: HomeScreenProps) {
  const syncUpcomingSlots = useTaskNotificationsStore((s) => s.syncUpcomingSlots)
  const currentHour = new Date().getHours()
  const { data: stats, isLoading } = useCandidateStats()

  useEffect(() => {
    const now = new Date()
    const upcoming = WORK_DAY_NOTIFICATION_SLOTS.filter((slot) => {
      const slotDate = new Date()
      slotDate.setHours(slot.hour, slot.minute, 0, 0)
      return slotDate.getTime() > now.getTime()
    }).map((slot) => ({
      id: `upcoming-${slot.hour}-${slot.minute}`,
      simTimeLabel: slot.simTimeLabel,
      label: slot.label,
    }))
    syncUpcomingSlots(upcoming)
  }, [syncUpcomingSlots])

  const greeting = currentHour < 12 ? "Buenos dias" : currentHour < 18 ? "Buenas tardes" : "Buenas noches"
  const firstName = userData.name ? userData.name.split(" ")[0] : "Usuario"

  const xp = stats?.xp ?? 0
  const level = stats?.level ?? 1
  const levelName = LEVEL_NAMES[level] ?? "Newcomer"
  const xpNext = stats?.xp_next_level ?? 500
  const xpPct = stats?.xp_progress_pct ?? 0
  const novaCvScore = stats?.nova_cv_score
  const matchesNew = stats?.matches_new ?? 0
  const simulationsActive = stats?.simulations_active ?? 0
  const topJobs = stats?.top_jobs ?? []

  return (
    <div className="min-h-screen pb-24 safe-area-top">
      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-[#94A3B8] text-sm">{greeting}</p>
            <h1 className="text-2xl font-semibold text-[#F1F5F9]">{firstName}</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 glass rounded-full">
              <Zap className="w-4 h-4 text-[#F59E0B]" />
              {isLoading ? (
                <Skeleton className="w-14 h-4" />
              ) : (
                <span className="text-[#F1F5F9] text-sm font-medium">
                  {xp.toLocaleString("es-CO")} XP
                </span>
              )}
            </div>
            <TaskNotificationBell
              variant="compact"
              onNavigateToSimulator={() => onNavigate("simulation")}
            />
          </div>
        </div>

        {/* Level progress */}
        <div className="glass rounded-2xl p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-[#F59E0B]" />
              {isLoading ? (
                <Skeleton className="w-36 h-5" />
              ) : (
                <span className="text-[#F1F5F9] font-medium">Nivel {level} — {levelName}</span>
              )}
            </div>
            {isLoading ? (
              <Skeleton className="w-24 h-4" />
            ) : (
              <span className="text-[#94A3B8] text-sm">
                {xp.toLocaleString("es-CO")} / {xpNext.toLocaleString("es-CO")} XP
              </span>
            )}
          </div>
          <div className="h-2 bg-[#1A1A2E] rounded-full overflow-hidden">
            {isLoading ? (
              <div className="h-full w-1/3 animate-pulse bg-white/10 rounded-full" />
            ) : (
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${xpPct}%` }}
                transition={{ duration: 1, delay: 0.3 }}
                className="h-full bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] rounded-full"
              />
            )}
          </div>
        </div>
      </div>

      {/* Recommended jobs */}
      <div className="px-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[#F1F5F9]">Matches perfectos para ti</h2>
          <button
            onClick={() => onNavigate("match")}
            className="text-[#7C3AED] text-sm font-medium flex items-center gap-1"
          >
            Ver todas
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="flex flex-col gap-3">
          {isLoading ? (
            [0, 1, 2].map((i) => (
              <div key={i} className="p-4 glass rounded-2xl flex items-center gap-4">
                <Skeleton className="w-12 h-12 rounded-xl" />
                <div className="flex-1 flex flex-col gap-2">
                  <Skeleton className="w-32 h-4" />
                  <Skeleton className="w-24 h-3" />
                </div>
                <Skeleton className="w-10 h-8" />
              </div>
            ))
          ) : topJobs.length > 0 ? (
            topJobs.map((job, index) => (
              <motion.button
                key={job.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.1 }}
                onClick={() => onNavigate("match")}
                className="w-full p-4 glass rounded-2xl flex items-center gap-4 text-left hover:bg-white/10 transition-colors"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold text-[#F1F5F9]"
                  style={{ backgroundColor: JOB_COLORS[index % JOB_COLORS.length] }}
                >
                  {job.company_name ? job.company_name[0].toUpperCase() : "?"}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-[#F1F5F9] font-medium">{job.company_name || "Empresa"}</p>
                    {job.industry && (
                      <span className="text-[#94A3B8] text-xs">{job.industry}</span>
                    )}
                  </div>
                  <p className="text-[#94A3B8] text-sm">{job.title}</p>
                </div>
                <div className="flex flex-col items-end">
                  <span
                    className="text-lg font-semibold"
                    style={{ color: job.match_score >= 90 ? "#10B981" : "#7C3AED" }}
                  >
                    {job.match_score}%
                  </span>
                  <span className="text-[#475569] text-xs">match</span>
                </div>
              </motion.button>
            ))
          ) : (
            <div className="p-6 glass rounded-2xl text-center">
              <p className="text-[#94A3B8] text-sm">
                Completa tu perfil para ver matches personalizados
              </p>
              <button
                onClick={() => onNavigate("profile")}
                className="text-[#7C3AED] text-sm font-medium mt-2"
              >
                Ir a perfil
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="px-6 mb-8">
        <h2 className="text-lg font-semibold text-[#F1F5F9] mb-4">Acciones rapidas</h2>
        <div className="grid grid-cols-2 gap-3">
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            onClick={() => onNavigate("simulation")}
            className="p-4 glass rounded-2xl text-left hover:bg-white/10 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-[#06B6D4]/20 flex items-center justify-center mb-3">
              <Sparkles className="w-5 h-5 text-[#06B6D4]" />
            </div>
            <p className="text-[#F1F5F9] font-medium text-sm">Simulador IA</p>
            {isLoading ? (
              <Skeleton className="w-24 h-3 mt-1" />
            ) : (
              <p className="text-[#94A3B8] text-xs">
                {simulationsActive > 0
                  ? `${simulationsActive} activo${simulationsActive !== 1 ? "s" : ""}`
                  : "Tareas con Gemini"}
              </p>
            )}
          </motion.button>

          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            onClick={() => onNavigate("interview")}
            className="p-4 glass rounded-2xl text-left hover:bg-white/10 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-[#10B981]/20 flex items-center justify-center mb-3">
              <Video className="w-5 h-5 text-[#10B981]" />
            </div>
            <p className="text-[#F1F5F9] font-medium text-sm">Entrevista</p>
            <p className="text-[#94A3B8] text-xs">Practica con IA</p>
          </motion.button>

          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            onClick={() => onNavigate("match")}
            className="p-4 glass rounded-2xl text-left hover:bg-white/10 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-[#7C3AED]/20 flex items-center justify-center mb-3">
              <Target className="w-5 h-5 text-[#7C3AED]" />
            </div>
            <p className="text-[#F1F5F9] font-medium text-sm">Matches</p>
            {isLoading ? (
              <Skeleton className="w-16 h-3 mt-1" />
            ) : (
              <p className="text-[#94A3B8] text-xs">
                {matchesNew > 0 ? `${matchesNew} nuevo${matchesNew !== 1 ? "s" : ""}` : "Ver todos"}
              </p>
            )}
          </motion.button>

          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            onClick={() => onNavigate("report")}
            className="p-4 glass rounded-2xl text-left hover:bg-white/10 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-[#F59E0B]/20 flex items-center justify-center mb-3">
              <TrendingUp className="w-5 h-5 text-[#F59E0B]" />
            </div>
            <p className="text-[#F1F5F9] font-medium text-sm">Mi reporte</p>
            {isLoading ? (
              <Skeleton className="w-16 h-3 mt-1" />
            ) : (
              <p className="text-[#94A3B8] text-xs">
                {novaCvScore !== null && novaCvScore !== undefined ? `Score: ${novaCvScore}` : "Sin analisis aun"}
              </p>
            )}
          </motion.button>
        </div>
      </div>

      {/* Nova CV Banner */}
      <div className="px-6 mb-8">
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          onClick={() => onNavigate("nova")}
          className="w-full p-4 rounded-2xl flex items-center gap-4 text-left"
          style={{ background: "linear-gradient(135deg, #7C3AED22 0%, #06B6D422 100%)", border: "1px solid #7C3AED44" }}
        >
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#06B6D4] flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-[#F1F5F9] font-semibold text-sm">Nova CV Intelligence</p>
            <p className="text-[#94A3B8] text-xs">Analiza tu CV con IA · Puntaje ATS, tecnico y recruiter</p>
          </div>
          <ChevronRight className="w-4 h-4 text-[#7C3AED]" />
        </motion.button>
      </div>
    </div>
  )
}
