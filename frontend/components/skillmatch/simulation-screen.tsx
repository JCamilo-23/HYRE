"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  ArrowLeft,
  Building2,
  CheckCircle,
  Clock,
  Heart,
  MapPin,
  Play,
  Sparkles,
  Zap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { WorkSimulatorChat } from "@/components/work-simulator/work-simulator-chat"
import { Screen } from "@/lib/hyre-types"
import type { MatchCompany } from "@/lib/match-companies"
import { useLikedCompaniesStore } from "@/store/liked-companies-store"

interface SimulationScreenProps {
  onNavigate: (screen: Screen) => void
}

const INDUSTRY_TASK_HINTS: Record<string, string> = {
  Tecnologia: "Incidentes, code reviews y entregables de ingenieria",
  Diseno: "Research UX, propuestas visuales e informes de usabilidad",
  Fintech: "Compliance, fraude, pagos y comunicacion de riesgo",
}

export function SimulationScreen({ onNavigate }: SimulationScreenProps) {
  const likedCompanies = useLikedCompaniesStore((s) => s.likedCompanies)
  const [selectedCompany, setSelectedCompany] = useState<MatchCompany | null>(null)
  const [started, setStarted] = useState(false)

  const handleBack = () => {
    if (started) {
      setStarted(false)
      return
    }
    if (selectedCompany) {
      setSelectedCompany(null)
      return
    }
    onNavigate("home")
  }

  if (started && selectedCompany) {
    return (
      <div className="min-h-screen pb-24 safe-area-top">
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-[#94A3B8] hover:text-[#F1F5F9] transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <span className="flex items-center gap-1.5 text-[#06B6D4] text-xs font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              Gemini
            </span>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 mb-4"
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-[#F1F5F9]"
              style={{ backgroundColor: selectedCompany.color }}
            >
              {selectedCompany.logo}
            </div>
            <div>
              <h1 className="text-lg font-semibold text-[#F1F5F9]">{selectedCompany.name}</h1>
              <p className="text-[#94A3B8] text-sm">{selectedCompany.vacancy}</p>
            </div>
          </motion.div>
        </div>

        <div className="px-6 pb-8">
          <WorkSimulatorChat
            key={selectedCompany.id}
            company={selectedCompany}
          />
        </div>
      </div>
    )
  }

  if (selectedCompany) {
    const taskHint =
      INDUSTRY_TASK_HINTS[selectedCompany.industry] ?? "Tareas adaptadas al perfil de la empresa"

    return (
      <div className="min-h-screen flex flex-col px-6 py-8 safe-area-top safe-area-bottom">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-[#94A3B8] hover:text-[#F1F5F9] transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Volver
        </button>

        <div className="flex items-center gap-4 mb-6">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold text-[#F1F5F9]"
            style={{ backgroundColor: selectedCompany.color }}
          >
            {selectedCompany.logo}
          </div>
          <div>
            <p className="text-[#F1F5F9] font-semibold text-lg">{selectedCompany.name}</p>
            <p className="text-[#94A3B8] text-sm">{selectedCompany.vacancy}</p>
            <p className="text-[#06B6D4] text-xs mt-0.5">{selectedCompany.industry}</p>
          </div>
        </div>

        <div className="glass rounded-2xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-[#F1F5F9] mb-3">Simulacion personalizada</h2>
          <p className="text-[#94A3B8] text-sm leading-relaxed mb-4">
            {selectedCompany.description}
          </p>
          <div className="rounded-xl bg-[#1E293B]/60 p-4 mb-4">
            <p className="text-xs font-medium text-[#06B6D4] mb-1">Tareas segun industria</p>
            <p className="text-[#F1F5F9] text-sm">{taskHint}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedCompany.culture.map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-1 rounded-lg bg-[#7C3AED]/20 text-[#C4B5FD] text-xs"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="glass rounded-2xl p-6 mb-auto">
          <h3 className="text-[#F1F5F9] font-medium mb-3">Reglas</h3>
          <ul className="space-y-2 text-[#94A3B8] text-sm">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-[#10B981] mt-0.5 flex-shrink-0" />
              Escribe «empezar jornada» para recibir tu primera tarea
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-[#10B981] mt-0.5 flex-shrink-0" />
              Las tareas reflejan el tipo de empresa ({selectedCompany.industry})
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-[#10B981] mt-0.5 flex-shrink-0" />
              Entrega trabajos completos antes del deadline
            </li>
          </ul>
        </div>

        <Button
          onClick={() => setStarted(true)}
          className="w-full h-14 btn-primary-gradient text-[#F1F5F9] font-medium text-base flex items-center justify-center gap-2 mt-6"
        >
          <Play className="w-5 h-5" />
          Iniciar simulador en {selectedCompany.name}
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col px-6 py-8 safe-area-top safe-area-bottom pb-24">
      <button
        onClick={() => onNavigate("home")}
        className="flex items-center gap-2 text-[#94A3B8] hover:text-[#F1F5F9] transition-colors mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        Volver
      </button>

      <div className="flex items-center gap-4 mb-2">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#06B6D4] to-[#7C3AED] flex items-center justify-center">
          <Sparkles className="w-8 h-8 text-[#F1F5F9]" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-[#F1F5F9]">Simulador IA</h1>
          <p className="text-[#94A3B8] text-sm">Practica en empresas que te gustaron</p>
        </div>
      </div>

      <p className="text-[#94A3B8] text-sm mb-6 leading-relaxed">
        Elige una empresa de tu match para vivir una jornada laboral simulada. Gemini generara
        tareas distintas segun la industria y el rol.
      </p>

      {likedCompanies.length === 0 ? (
        <div className="glass rounded-2xl p-8 flex flex-col items-center text-center flex-1">
          <div className="w-16 h-16 rounded-full bg-[#7C3AED]/20 flex items-center justify-center mb-4">
            <Heart className="w-8 h-8 text-[#7C3AED]" />
          </div>
          <h2 className="text-[#F1F5F9] font-semibold text-lg mb-2">Aun no tienes matches</h2>
          <p className="text-[#94A3B8] text-sm mb-6 max-w-xs">
            Desliza a la derecha en empresas que te interesen para desbloquear simulaciones
            personalizadas aqui.
          </p>
          <Button
            onClick={() => onNavigate("match")}
            className="btn-primary-gradient text-[#F1F5F9]"
          >
            Ir a Match
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-[#94A3B8] text-sm">
            <Heart className="w-4 h-4 text-[#F472B6]" />
            {likedCompanies.length} empresa{likedCompanies.length !== 1 ? "s" : ""} que te
            gustaron
          </div>

          {likedCompanies.map((company, index) => (
            <motion.button
              key={company.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => setSelectedCompany(company)}
              className="w-full glass rounded-2xl p-5 text-left hover:border-[#7C3AED]/40 border border-transparent transition-colors"
            >
              <div className="flex items-start gap-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold text-[#F1F5F9] shrink-0"
                  style={{ backgroundColor: company.color }}
                >
                  {company.logo}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="text-[#F1F5F9] font-medium truncate">{company.name}</p>
                    <span className="text-[#10B981] text-xs font-medium shrink-0">
                      {company.match}% match
                    </span>
                  </div>
                  <p className="text-[#94A3B8] text-sm mb-2">{company.vacancy}</p>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-[#64748B]">
                    <span className="flex items-center gap-1">
                      <Building2 className="w-3 h-3" />
                      {company.industry}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {company.location}
                    </span>
                  </div>
                  <p className="text-[#06B6D4] text-xs mt-2">
                    {INDUSTRY_TASK_HINTS[company.industry] ?? "Tareas personalizadas"}
                  </p>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      )}

      <div className="glass rounded-2xl p-5 mt-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#06B6D4]/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-[#06B6D4]" />
            </div>
            <div>
              <p className="text-[#F1F5F9] font-medium text-sm">Tareas con IA</p>
              <p className="text-[#94A3B8] text-xs">Por industria</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#7C3AED]/20 flex items-center justify-center">
              <Clock className="w-5 h-5 text-[#7C3AED]" />
            </div>
            <div>
              <p className="text-[#F1F5F9] font-medium text-sm">Horario laboral</p>
              <p className="text-[#94A3B8] text-xs">Notificaciones en vivo</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F59E0B]/20 flex items-center justify-center">
              <Zap className="w-5 h-5 text-[#F59E0B]" />
            </div>
            <div>
              <p className="text-[#F1F5F9] font-medium text-sm">+2500 XP</p>
              <p className="text-[#94A3B8] text-xs">Al completar jornada</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#10B981]/20 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-[#10B981]" />
            </div>
            <div>
              <p className="text-[#F1F5F9] font-medium text-sm">Evaluacion IA</p>
              <p className="text-[#94A3B8] text-xs">Feedback exigente</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
