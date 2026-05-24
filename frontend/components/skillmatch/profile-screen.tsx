"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Settings,
  Edit3,
  Video,
  ChevronRight,
  ChevronDown,
  Zap,
  Trophy,
  Target,
  Briefcase,
  Clock,
} from "lucide-react"
import { Screen, UserData } from "@/lib/hyre-types"

interface ProfileScreenProps {
  onNavigate: (screen: Screen) => void
  userData: UserData
}

const skills = [
  { name: "React", level: 85, color: "#7C3AED" },
  { name: "TypeScript", level: 78, color: "#06B6D4" },
  { name: "Comunicacion", level: 92, color: "#10B981" },
  { name: "Trabajo en equipo", level: 88, color: "#F59E0B" },
  { name: "Liderazgo", level: 72, color: "#7C3AED" },
]

const badges = [
  { id: 1, name: "Clear Communicator", icon: "🗣️", company: "TechCorp" },
  { id: 2, name: "Quick Thinker", icon: "⚡", company: "TechCorp" },
  { id: 3, name: "Team Player", icon: "🤝", company: "HYRE" },
  { id: 4, name: "First Match", icon: "🎯", company: "HYRE" },
  { id: 5, name: "Simulation Master", icon: "🏆", company: "TechCorp" },
]

const participated = [
  { id: 1, company: "TechCorp", role: "Desarrollador Frontend Jr", score: 87, type: "simulation", logo: "T", color: "#7C3AED" },
  { id: 2, company: "TechCorp", role: "Desarrollador Frontend Jr", score: 84, type: "interview", logo: "T", color: "#7C3AED" },
]

const waiting = [
  { id: 3, company: "DesignLab", role: "UX Designer", daysAgo: 2, logo: "D", color: "#06B6D4" },
]

export function ProfileScreen({ onNavigate, userData }: ProfileScreenProps) {
  const [historialOpen, setHistorialOpen] = useState(false)
  const xp = 2450
  const level = 3
  const nextLevelXp = 3500

  const getInitials = (name: string) => {
    if (!name) return "U"
    const parts = name.split(" ")
    return parts.length >= 2 ? parts[0][0] + parts[1][0] : name[0].toUpperCase()
  }

  const initials = getInitials(userData.name)
  const displayName = userData.userType === "company" && userData.company?.companyName
    ? userData.company.companyName
    : userData.name || "Usuario"
  const displayEmail = userData.email || "usuario@hyre.com"
  const isCompany = userData.userType === "company"

  return (
    <div className="min-h-screen pb-24 safe-area-top">
      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-[#F1F5F9]">
            {isCompany ? "Perfil de empresa" : "Mi perfil"}
          </h1>
          <button className="w-10 h-10 glass rounded-full flex items-center justify-center">
            <Settings className="w-5 h-5 text-[#94A3B8]" />
          </button>
        </div>

        {/* Profile card */}
        <div className="glass rounded-2xl p-6 relative">
          <button className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-[#7C3AED]/20 flex items-center justify-center">
            <Edit3 className="w-4 h-4 text-[#7C3AED]" />
          </button>

          <div className="flex items-center gap-4 mb-4">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#06B6D4] flex items-center justify-center text-2xl font-bold text-[#F1F5F9]">
              {initials}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-[#F1F5F9]">{displayName}</h2>
              <p className="text-[#94A3B8] text-sm">{displayEmail}</p>
              <p className="text-[#475569] text-xs">
                {isCompany
                  ? `Contacto: ${userData.name || "Representante"}`
                  : "Buscando oportunidades"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-2 px-3 py-1.5 glass rounded-full">
              <Trophy className="w-4 h-4 text-[#F59E0B]" />
              <span className="text-[#F1F5F9] text-sm font-medium">Nivel {level}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 glass rounded-full">
              <Zap className="w-4 h-4 text-[#F59E0B]" />
              <span className="text-[#F1F5F9] text-sm font-medium">{xp} XP</span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[#94A3B8] text-xs">Progreso al nivel {level + 1}</span>
              <span className="text-[#94A3B8] text-xs">{xp} / {nextLevelXp}</span>
            </div>
            <div className="h-2 bg-[#1A1A2E] rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(xp / nextLevelXp) * 100}%` }}
                transition={{ duration: 1 }}
                className="h-full bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] rounded-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Video intro */}
      <div className="px-6 mb-6">
        <button className="w-full p-4 glass rounded-xl flex items-center gap-4 hover:bg-white/10 transition-colors">
          <div className="w-12 h-12 rounded-xl bg-[#7C3AED]/20 flex items-center justify-center">
            <Video className="w-6 h-6 text-[#7C3AED]" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-[#F1F5F9] font-medium">Video de presentacion</p>
            <p className="text-[#94A3B8] text-xs">Candidatos con video tienen 3x mas matches</p>
          </div>
          <ChevronRight className="w-5 h-5 text-[#94A3B8]" />
        </button>
      </div>

      {/* Skills */}
      <div className="px-6 mb-6">
        <h2 className="text-lg font-semibold text-[#F1F5F9] mb-4">Habilidades</h2>
        <div className="glass rounded-2xl p-4">
          <div className="space-y-3">
            {skills.map((skill, index) => (
              <div key={skill.name}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[#F1F5F9] text-sm">{skill.name}</span>
                  <span className="text-[#94A3B8] text-xs">{skill.level}%</span>
                </div>
                <div className="h-2 bg-[#1A1A2E] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${skill.level}%` }}
                    transition={{ duration: 1, delay: index * 0.1 }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: skill.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Badges */}
      <div className="px-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[#F1F5F9]">Badges</h2>
          <span className="text-[#94A3B8] text-sm">{badges.length} ganados</span>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {badges.map((badge) => (
            <div key={badge.id} className="flex-shrink-0 w-24 glass rounded-xl p-3 text-center">
              <div className="text-2xl mb-2">{badge.icon}</div>
              <p className="text-[#F1F5F9] text-xs font-medium mb-0.5">{badge.name}</p>
              <p className="text-[#475569] text-xs">{badge.company}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Historial — collapsible */}
      <div className="px-6 mb-6">
        <button
          onClick={() => setHistorialOpen(!historialOpen)}
          className="w-full p-4 glass rounded-xl flex items-center justify-between hover:bg-white/10 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#7C3AED]/20 flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-[#7C3AED]" />
            </div>
            <div className="text-left">
              <p className="text-[#F1F5F9] font-medium">Historial</p>
              <p className="text-[#94A3B8] text-xs">
                {participated.length} participaciones · {waiting.length} esperando
              </p>
            </div>
          </div>
          <motion.div animate={{ rotate: historialOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown className="w-5 h-5 text-[#94A3B8]" />
          </motion.div>
        </button>

        <AnimatePresence>
          {historialOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="pt-3 space-y-3">
                {/* Participaciones */}
                <p className="text-[#475569] text-xs font-medium uppercase tracking-wider px-1">
                  Empresas donde participé
                </p>
                {participated.map((item) => (
                  <div key={item.id} className="glass rounded-xl p-4 flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-[#F1F5F9]"
                      style={{ backgroundColor: item.color }}
                    >
                      {item.logo}
                    </div>
                    <div className="flex-1">
                      <p className="text-[#F1F5F9] text-sm font-medium">{item.company}</p>
                      <p className="text-[#94A3B8] text-xs">{item.role}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[#10B981] text-sm font-medium">{item.score}/100</p>
                      <p className="text-[#475569] text-xs">
                        {item.type === "simulation" ? "Simulacion" : "Entrevista"}
                      </p>
                    </div>
                  </div>
                ))}

                {/* Esperando respuesta */}
                <p className="text-[#475569] text-xs font-medium uppercase tracking-wider px-1 pt-2">
                  Esperando respuesta
                </p>
                {waiting.map((item) => (
                  <div key={item.id} className="glass rounded-xl p-4 flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-[#F1F5F9]"
                      style={{ backgroundColor: item.color }}
                    >
                      {item.logo}
                    </div>
                    <div className="flex-1">
                      <p className="text-[#F1F5F9] text-sm font-medium">{item.company}</p>
                      <p className="text-[#94A3B8] text-xs">{item.role}</p>
                    </div>
                    <div className="flex items-center gap-1 text-[#F59E0B]">
                      <Clock className="w-4 h-4" />
                      <span className="text-xs">Hace {item.daysAgo}d</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Stats */}
      <div className="px-6">
        <div className="grid grid-cols-3 gap-3">
          <div className="glass rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-[#7C3AED]">5</p>
            <p className="text-[#94A3B8] text-xs">Matches</p>
          </div>
          <div className="glass rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-[#06B6D4]">3</p>
            <p className="text-[#94A3B8] text-xs">Simulaciones</p>
          </div>
          <div className="glass rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-[#10B981]">2</p>
            <p className="text-[#94A3B8] text-xs">Entrevistas</p>
          </div>
        </div>
      </div>
    </div>
  )
}
