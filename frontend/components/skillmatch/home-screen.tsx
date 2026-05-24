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
} from "lucide-react"
import { useEffect } from "react"
import { Screen, UserData } from "@/lib/hyre-types"
import { TaskNotificationBell } from "@/components/notifications/task-notification-bell"
import { useTaskNotificationsStore } from "@/store/task-notifications-store"
import { WORK_DAY_NOTIFICATION_SLOTS } from "@/modules/work-simulator/constants"

interface HomeScreenProps {
  onNavigate: (screen: Screen) => void
  userData: UserData
}

const recommendedCompanies = [
  {
    id: 1,
    name: "TechCorp",
    industry: "Tecnologia",
    match: 94,
    vacancy: "Desarrollador Frontend",
    logo: "T",
    color: "#7C3AED",
  },
  {
    id: 2,
    name: "DesignLab",
    industry: "Diseno",
    match: 89,
    vacancy: "UX Designer",
    logo: "D",
    color: "#06B6D4",
  },
  {
    id: 3,
    name: "StartupXYZ",
    industry: "Fintech",
    match: 87,
    vacancy: "Product Manager",
    logo: "S",
    color: "#10B981",
  },
]

export function HomeScreen({ onNavigate, userData }: HomeScreenProps) {
  const syncUpcomingSlots = useTaskNotificationsStore((s) => s.syncUpcomingSlots)
  const currentHour = new Date().getHours()

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
              <span className="text-[#F1F5F9] text-sm font-medium">2,450 XP</span>
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
              <span className="text-[#F1F5F9] font-medium">Nivel 3 - Rising Star</span>
            </div>
            <span className="text-[#94A3B8] text-sm">2,450 / 3,500 XP</span>
          </div>
          <div className="h-2 bg-[#1A1A2E] rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "70%" }}
              transition={{ duration: 1, delay: 0.3 }}
              className="h-full bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] rounded-full"
            />
          </div>
        </div>
      </div>

      {/* Recommended companies */}
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
          {recommendedCompanies.map((company, index) => (
            <motion.button
              key={company.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.1 }}
              onClick={() => onNavigate("match")}
              className="w-full p-4 glass rounded-2xl flex items-center gap-4 text-left hover:bg-white/10 transition-colors"
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold text-[#F1F5F9]"
                style={{ backgroundColor: company.color }}
              >
                {company.logo}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-[#F1F5F9] font-medium">{company.name}</p>
                  <span className="text-[#94A3B8] text-xs">{company.industry}</span>
                </div>
                <p className="text-[#94A3B8] text-sm">{company.vacancy}</p>
              </div>
              <div className="flex flex-col items-end">
                <span
                  className="text-lg font-semibold"
                  style={{ color: company.match >= 90 ? "#10B981" : "#7C3AED" }}
                >
                  {company.match}%
                </span>
                <span className="text-[#475569] text-xs">match</span>
              </div>
            </motion.button>
          ))}
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
            <p className="text-[#94A3B8] text-xs">Tareas con Gemini</p>
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
            <p className="text-[#94A3B8] text-xs">TechCorp Colombia</p>
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
            <p className="text-[#94A3B8] text-xs">3 nuevos</p>
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
            <p className="text-[#94A3B8] text-xs">Score: 84</p>
          </motion.button>
        </div>
      </div>
    </div>
  )
}
