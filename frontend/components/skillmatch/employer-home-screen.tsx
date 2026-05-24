"use client"

import { motion } from "framer-motion"
import {
  BarChart3,
  Building2,
  ChevronRight,
  ClipboardCheck,
  MapPin,
  UserCheck,
  Users,
} from "lucide-react"
import { Screen, UserData } from "@/lib/hyre-types"
import { EMPLOYER_CANDIDATES } from "@/lib/employer-mock-data"

interface EmployerHomeScreenProps {
  onNavigate: (screen: Screen) => void
  userData: UserData
}

export function EmployerHomeScreen({ onNavigate, userData }: EmployerHomeScreenProps) {
  const company = userData.company
  const companyName = company?.companyName || "Tu empresa"
  const vacancy = company?.vacancyTitle || "Sin vacante activa"
  const pendingCount = EMPLOYER_CANDIDATES.filter((c) => c.status === "pending").length
  const acceptedCount = EMPLOYER_CANDIDATES.filter((c) => c.status === "accepted").length

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

      <div className="px-6 mb-6">
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Por revisar", value: String(pendingCount), icon: ClipboardCheck, color: "#F59E0B", screen: "employerAccept" as Screen },
            { label: "Aceptados", value: String(acceptedCount), icon: UserCheck, color: "#10B981", screen: "employerAccept" as Screen },
            { label: "Reportes IA", value: String(EMPLOYER_CANDIDATES.length), icon: BarChart3, color: "#06B6D4", screen: "employerReports" as Screen },
          ].map((stat) => (
            <button
              key={stat.label}
              onClick={() => onNavigate(stat.screen)}
              className="glass rounded-xl p-3 text-center hover:bg-white/5 transition-colors"
            >
              <stat.icon className="w-4 h-4 mx-auto mb-1" style={{ color: stat.color }} />
              <p className="text-[#F1F5F9] font-bold text-lg">{stat.value}</p>
              <p className="text-[#475569] text-xs">{stat.label}</p>
            </button>
          ))}
        </div>
      </div>

      {pendingCount > 0 && (
        <div className="px-6 mb-6">
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => onNavigate("employerAccept")}
            className="w-full p-4 rounded-2xl text-left border border-[#F59E0B]/30 bg-gradient-to-r from-[#F59E0B]/15 to-[#06B6D4]/10"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#F1F5F9] font-medium mb-1">
                  {pendingCount} candidato{pendingCount > 1 ? "s" : ""} esperando tu decision
                </p>
                <p className="text-[#94A3B8] text-sm">
                  Revisa sus reportes IA y acepta a quienes encajen
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-[#F59E0B] shrink-0" />
            </div>
          </motion.button>
        </div>
      )}

      <div className="px-6">
        <h2 className="text-[#F1F5F9] font-medium mb-4">Acciones rapidas</h2>
        <div className="flex flex-col gap-3">
          <ActionCard
            icon={UserCheck}
            title="Aceptar candidatos"
            description="Revisa evaluaciones y decide quien avanza"
            color="#10B981"
            onClick={() => onNavigate("employerAccept")}
          />
          <ActionCard
            icon={BarChart3}
            title="Ver reportes IA"
            description="Consulta el desglose completo de cada candidato"
            color="#06B6D4"
            onClick={() => onNavigate("employerReports")}
          />
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

function ActionCard({
  icon: Icon,
  title,
  description,
  color,
  onClick,
}: {
  icon: typeof UserCheck
  title: string
  description: string
  color: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="glass rounded-xl p-4 text-left hover:bg-white/5 transition-colors flex items-center gap-4"
    >
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
        style={{ backgroundColor: `${color}20` }}
      >
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[#F1F5F9] font-medium">{title}</p>
        <p className="text-[#94A3B8] text-sm">{description}</p>
      </div>
      <ChevronRight className="w-5 h-5 text-[#475569] shrink-0" />
    </button>
  )
}
