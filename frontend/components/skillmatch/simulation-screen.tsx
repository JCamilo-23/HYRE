"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  Play,
  Sparkles,
  Zap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { WorkSimulatorChat } from "@/components/work-simulator/work-simulator-chat"
import { Screen } from "@/lib/hyre-types"

interface SimulationScreenProps {
  onNavigate: (screen: Screen) => void
}

const simulation = {
  company: "TechCorp Colombia",
  role: "Desarrollador Frontend Jr",
  duration: "Jornada laboral simulada",
  xp: 2500,
}

export function SimulationScreen({ onNavigate }: SimulationScreenProps) {
  const [started, setStarted] = useState(false)

  if (!started) {
    return (
      <div className="min-h-screen flex flex-col px-6 py-8 safe-area-top safe-area-bottom">
        <button
          onClick={() => onNavigate("home")}
          className="flex items-center gap-2 text-[#94A3B8] hover:text-[#F1F5F9] transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Volver
        </button>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#06B6D4] to-[#7C3AED] flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-[#F1F5F9]" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-[#F1F5F9]">Simulador IA</h1>
            <p className="text-[#94A3B8] text-sm">Powered by Gemini</p>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-xl bg-[#7C3AED] flex items-center justify-center text-lg font-bold text-[#F1F5F9]">
            T
          </div>
          <div>
            <p className="text-[#F1F5F9] font-medium">{simulation.company}</p>
            <p className="text-[#94A3B8] text-sm">{simulation.role}</p>
          </div>
        </div>

        <div className="glass rounded-2xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-[#F1F5F9] mb-4">Como funciona</h2>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#06B6D4]/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-[#06B6D4]" />
              </div>
              <div>
                <p className="text-[#F1F5F9] font-medium text-sm">Tareas con IA</p>
                <p className="text-[#94A3B8] text-xs">Generadas por Gemini</p>
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
                <p className="text-[#F1F5F9] font-medium text-sm">+{simulation.xp} XP</p>
                <p className="text-[#94A3B8] text-xs">Al completar jornada</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#10B981]/20 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-[#10B981]" />
              </div>
              <div>
                <p className="text-[#F1F5F9] font-medium text-sm">Evaluacion IA</p>
                <p className="text-[#94A3B8] text-xs">Feedback en tiempo real</p>
              </div>
            </div>
          </div>

          <p className="text-[#94A3B8] text-sm leading-relaxed">
            Vive una jornada laboral real con tareas generadas por Gemini. Recibe asignaciones,
            entrega trabajos concretos y recibe evaluacion exigente de tu desempeno.
          </p>
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
              Entrega trabajos completos: correos, informes, planes
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-[#10B981] mt-0.5 flex-shrink-0" />
              Cada tarea tiene deadline — actua como en un trabajo real
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-[#10B981] mt-0.5 flex-shrink-0" />
              Usa «Demo rapido» para probar notificaciones cada 8 min
            </li>
          </ul>
        </div>

        <Button
          onClick={() => setStarted(true)}
          className="w-full h-14 btn-primary-gradient text-[#F1F5F9] font-medium text-base flex items-center justify-center gap-2 mt-6"
        >
          <Play className="w-5 h-5" />
          Iniciar simulador IA
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-24 safe-area-top">
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => onNavigate("home")}
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
          <div className="w-10 h-10 rounded-xl bg-[#7C3AED] flex items-center justify-center text-sm font-bold text-[#F1F5F9]">
            T
          </div>
          <div>
            <h1 className="text-lg font-semibold text-[#F1F5F9]">{simulation.company}</h1>
            <p className="text-[#94A3B8] text-sm">{simulation.role}</p>
          </div>
        </motion.div>
      </div>

      <div className="px-6 pb-8">
        <WorkSimulatorChat
          roleTitle={simulation.role}
          companyName={simulation.company}
        />
      </div>
    </div>
  )
}
