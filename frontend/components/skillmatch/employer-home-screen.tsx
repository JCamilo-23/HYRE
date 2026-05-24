"use client"

import { motion } from "framer-motion"
import {
  BarChart3,
  Briefcase,
  Building2,
  ChevronRight,
  ClipboardCheck,
  Plus,
  UserCheck,
  Users,
} from "lucide-react"
import { Screen, UserData } from "@/lib/hyre-types"
import { useBusinessStats } from "@/modules/stats/hooks"

interface EmployerHomeScreenProps {
  onNavigate: (screen: Screen) => void
  userData: UserData
}

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-white/10 rounded ${className}`} />
}

export function EmployerHomeScreen({ onNavigate, userData }: EmployerHomeScreenProps) {
  const company = userData.company
  const companyName = company?.companyName || userData.name || "Tu empresa"
  const { data: stats, isLoading } = useBusinessStats()

  const jobsActive = stats?.jobs_active ?? 0
  const jobsTotal = stats?.jobs_total ?? 0
  const candidatesMatched = stats?.candidates_matched ?? 0
  const matchesMutual = stats?.matches_mutual ?? 0
  const profileCompleteness = stats?.profile_completeness ?? 0
  const recentCandidates = stats?.recent_candidates ?? []

  return (
    <div className="min-h-screen pb-24 safe-area-top">
      {/* Header */}
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

      {/* Stats grid */}
      <div className="px-6 mb-6">
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Vacantes activas", value: isLoading ? null : jobsActive, icon: Briefcase, color: "#06B6D4" },
            { label: "Candidatos", value: isLoading ? null : candidatesMatched, icon: Users, color: "#7C3AED" },
            { label: "Matches mutuos", value: isLoading ? null : matchesMutual, icon: UserCheck, color: "#10B981" },
            { label: "Perfil completo", value: isLoading ? null : `${profileCompleteness}%`, icon: ClipboardCheck, color: "#F59E0B" },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-xl p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
                <span className="text-[#94A3B8] text-xs">{stat.label}</span>
              </div>
              {stat.value === null ? (
                <Skeleton className="w-12 h-7" />
              ) : (
                <p className="text-[#F1F5F9] font-bold text-2xl">{stat.value}</p>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* CTA: no active jobs */}
      {!isLoading && jobsActive === 0 && (
        <div className="px-6 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-2xl border border-[#06B6D4]/30 bg-gradient-to-r from-[#06B6D4]/15 to-[#7C3AED]/10"
          >
            <p className="text-[#F1F5F9] font-medium mb-1">Publica tu primera vacante</p>
            <p className="text-[#94A3B8] text-sm mb-3">
              Empieza a recibir candidatos compatibles con tu empresa
            </p>
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#06B6D4] text-white text-sm font-medium">
              <Plus className="w-4 h-4" />
              Crear vacante
            </button>
          </motion.div>
        </div>
      )}

      {/* Recent matched candidates */}
      <div className="px-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[#F1F5F9] font-semibold">Candidatos recientes</h2>
          <button
            onClick={() => onNavigate("employerCandidates")}
            className="text-[#06B6D4] text-sm font-medium flex items-center gap-1"
          >
            Ver todos <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {isLoading ? (
          <div className="flex flex-col gap-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="p-4 glass rounded-2xl flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="flex-1 flex flex-col gap-2">
                  <Skeleton className="w-32 h-4" />
                  <Skeleton className="w-20 h-3" />
                </div>
                <Skeleton className="w-10 h-8" />
              </div>
            ))}
          </div>
        ) : recentCandidates.length > 0 ? (
          <div className="flex flex-col gap-3">
            {recentCandidates.map((c, index) => (
              <motion.button
                key={c.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.07 }}
                onClick={() => onNavigate("employerCandidates")}
                className="w-full p-4 glass rounded-2xl flex items-center gap-3 text-left hover:bg-white/5 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-[#7C3AED]/30 flex items-center justify-center text-[#F1F5F9] font-semibold shrink-0">
                  {c.full_name ? c.full_name[0].toUpperCase() : "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[#F1F5F9] font-medium text-sm truncate">
                    {c.full_name ?? "Candidato anónimo"}
                  </p>
                  <p className="text-[#94A3B8] text-xs">{c.job_title}</p>
                </div>
                <div className="flex flex-col items-end shrink-0">
                  <span
                    className="text-sm font-semibold"
                    style={{ color: c.match_score >= 80 ? "#10B981" : "#06B6D4" }}
                  >
                    {c.match_score}%
                  </span>
                  <span className="text-[#475569] text-xs">match</span>
                </div>
              </motion.button>
            ))}
          </div>
        ) : (
          <div className="p-6 glass rounded-2xl text-center">
            <p className="text-[#94A3B8] text-sm">Aun no hay candidatos. Publica una vacante para empezar.</p>
          </div>
        )}
      </div>

      {/* Navigate to reports */}
      <div className="px-6">
        <button
          onClick={() => onNavigate("employerCandidates")}
          className="w-full glass rounded-xl p-4 text-left hover:bg-white/5 transition-colors flex items-center gap-4"
        >
          <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 bg-[#06B6D4]/20">
            <BarChart3 className="w-5 h-5 text-[#06B6D4]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[#F1F5F9] font-medium">Reportes y candidatos</p>
            <p className="text-[#94A3B8] text-sm">
              Evaluaciones IA, desglose completo y decision de aceptacion
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-[#475569] shrink-0" />
        </button>
      </div>

      {/* Culture tags from profile */}
      {company && company.culture && company.culture.length > 0 && (
        <div className="px-6 mt-6">
          <h2 className="text-[#F1F5F9] font-medium mb-3">Tu perfil de match</h2>
          <div className="glass rounded-xl p-4">
            {company.description && (
              <p className="text-[#94A3B8] text-sm mb-3 line-clamp-2">{company.description}</p>
            )}
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
