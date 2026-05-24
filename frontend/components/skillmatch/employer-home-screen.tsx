"use client"

import { motion } from "framer-motion"
import {
  Building2,
  ChevronRight,
  MapPin,
  Sparkles,
  Target,
  TrendingUp,
  Users,
} from "lucide-react"
import { Screen, UserData } from "@/lib/hyre-types"

interface EmployerHomeScreenProps {
  onNavigate: (screen: Screen) => void
  userData: UserData
}

const mockCandidates = [
  {
    id: 1,
    name: "Maria G.",
    role: "Desarrolladora Frontend",
    match: 92,
    skills: ["React", "TypeScript", "Comunicacion"],
    initials: "MG",
    color: "#7C3AED",
  },
  {
    id: 2,
    name: "Carlos R.",
    role: "UX Designer",
    match: 88,
    skills: ["Figma", "Research", "Prototipado"],
    initials: "CR",
    color: "#06B6D4",
  },
  {
    id: 3,
    name: "Ana L.",
    role: "Product Manager",
    match: 85,
    skills: ["Agile", "Analytics", "Liderazgo"],
    initials: "AL",
    color: "#10B981",
  },
]

export function EmployerHomeScreen({ onNavigate, userData }: EmployerHomeScreenProps) {
  const company = userData.company
  const companyName = company?.companyName || "Tu empresa"
  const vacancy = company?.vacancyTitle || "Sin vacante activa"

  return (
    <div className="min-h-screen pb-24 safe-area-top">
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-[#06B6D4]/20 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-[#06B6D4]" />
          </div>
          <div>
            <p className="text-[#94A3B8] text-sm">Panel de empresa</p>
            <h1 className="text-xl font-semibold text-[#F1F5F9]">{companyName}</h1>
          </div>
        </div>
      </div>

      <div className="px-6 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-strong rounded-2xl p-4 border border-[#06B6D4]/20"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[#06B6D4] text-xs font-medium uppercase tracking-wide">
              Vacante activa
            </span>
            <span className="px-2 py-0.5 rounded-full bg-[#10B981]/20 text-[#10B981] text-xs">
              Activa
            </span>
          </div>
          <h2 className="text-[#F1F5F9] font-medium mb-2">{vacancy}</h2>
          {company && (
            <div className="flex flex-wrap gap-3 text-[#94A3B8] text-xs">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {company.location}
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {company.size}
              </span>
            </div>
          )}
        </motion.div>
      </div>

      <div className="px-6 mb-4">
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Matches", value: "12", icon: Target, color: "#7C3AED" },
            { label: "En pipeline", value: "5", icon: TrendingUp, color: "#06B6D4" },
            { label: "Simulaciones", value: "3", icon: Sparkles, color: "#10B981" },
          ].map((stat) => (
            <div key={stat.label} className="glass rounded-xl p-3 text-center">
              <stat.icon className="w-4 h-4 mx-auto mb-1" style={{ color: stat.color }} />
              <p className="text-[#F1F5F9] font-bold text-lg">{stat.value}</p>
              <p className="text-[#475569] text-xs">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="px-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[#F1F5F9] font-medium">Candidatos recomendados</h2>
          <button className="text-[#06B6D4] text-sm flex items-center gap-1">
            Ver todos
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {mockCandidates.map((candidate, index) => (
            <motion.button
              key={candidate.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass rounded-xl p-4 text-left hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold text-[#F1F5F9]"
                  style={{ backgroundColor: candidate.color }}
                >
                  {candidate.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-[#F1F5F9] font-medium">{candidate.name}</p>
                    <span className="text-[#10B981] font-bold text-sm">{candidate.match}%</span>
                  </div>
                  <p className="text-[#94A3B8] text-sm">{candidate.role}</p>
                  <div className="flex gap-1.5 mt-2">
                    {candidate.skills.slice(0, 3).map((skill) => (
                      <span
                        key={skill}
                        className="px-2 py-0.5 rounded-md bg-[#1A1A2E] text-[#94A3B8] text-xs"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {company && company.culture.length > 0 && (
        <div className="px-6 mt-6">
          <h2 className="text-[#F1F5F9] font-medium mb-3">Tu perfil de match</h2>
          <div className="glass rounded-xl p-4">
            <p className="text-[#94A3B8] text-sm mb-3 line-clamp-2">{company.description}</p>
            <div className="flex flex-wrap gap-2">
              {company.culture.map((trait) => (
                <span
                  key={trait}
                  className="px-2.5 py-1 rounded-full bg-[#06B6D4]/20 text-[#06B6D4] text-xs"
                >
                  {trait}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
