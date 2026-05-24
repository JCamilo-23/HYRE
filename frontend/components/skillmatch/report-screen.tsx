"use client"

import { motion } from "framer-motion"
import { 
  ArrowLeft, 
  Award, 
  TrendingUp,
  MessageSquare,
  Users,
  Brain,
  Target,
  Zap,
  ChevronRight,
  Share2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Screen } from "@/lib/hyre-types"
import { useNovaStore } from "@/store/nova-store"

interface ReportScreenProps {
  onNavigate: (screen: Screen) => void
}

const categories = [
  { id: "communication", label: "Comunicacion", score: 88, level: "Sobresaliente", icon: MessageSquare, color: "#7C3AED" },
  { id: "confidence", label: "Confianza", score: 82, level: "Alto", icon: TrendingUp, color: "#06B6D4" },
  { id: "leadership", label: "Liderazgo", score: 75, level: "Alto", icon: Users, color: "#10B981" },
  { id: "adaptability", label: "Adaptabilidad", score: 90, level: "Sobresaliente", icon: Brain, color: "#F59E0B" },
  { id: "soft-skills", label: "Habilidades blandas", score: 85, level: "Alto", icon: Target, color: "#7C3AED" },
]

const badges = [
  { id: 1, name: "Clear Communicator", company: "TechCorp", color: "#7C3AED" },
  { id: 2, name: "Quick Thinker", company: "TechCorp", color: "#06B6D4" },
  { id: 3, name: "Team Player", company: "HYRE", color: "#10B981" },
]

const tips = [
  "Practica responder con mas ejemplos concretos de tu experiencia",
  "Manten un ritmo de habla constante durante toda la entrevista",
  "Considera mencionar mas sobre tu trabajo en equipo",
]

export function ReportScreen({ onNavigate }: ReportScreenProps) {
  const openNova = useNovaStore((s) => s.open)
  const overallScore = 84

  return (
    <div className="min-h-screen pb-24 safe-area-top">
      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <button
          onClick={() => onNavigate("home")}
          className="flex items-center gap-2 text-[#94A3B8] hover:text-[#F1F5F9] transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Volver
        </button>

        <h1 className="text-2xl font-semibold text-[#F1F5F9] mb-1">Tu reporte</h1>
        <p className="text-[#94A3B8] text-sm">Entrevista con TechCorp Colombia</p>
      </div>

      {/* Overall score */}
      <div className="px-6 mb-6">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="glass rounded-2xl p-6 text-center relative overflow-hidden"
        >
          {/* Background glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#10B981]/20 to-transparent" />
          
          <div className="relative">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="text-6xl font-bold text-[#10B981] mb-2"
            >
              {overallScore}
            </motion.div>
            <p className="text-[#94A3B8]">Score general</p>
            
            {/* Percentile */}
            <div className="mt-4 px-4 py-2 bg-[#10B981]/10 rounded-xl inline-block">
              <p className="text-[#10B981] text-sm font-medium">
                Estas en el top 15% de candidatos para este rol
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Categories breakdown */}
      <div className="px-6 mb-6">
        <h2 className="text-lg font-semibold text-[#F1F5F9] mb-4">Desglose por categoria</h2>
        <div className="space-y-3">
          {categories.map((category, index) => {
            const Icon = category.icon
            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass rounded-xl p-4"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${category.color}20` }}
                  >
                    <Icon className="w-5 h-5" style={{ color: category.color }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[#F1F5F9] font-medium">{category.label}</p>
                    <p className="text-[#94A3B8] text-xs">{category.level}</p>
                  </div>
                  <span 
                    className="text-2xl font-bold"
                    style={{ color: category.score >= 85 ? "#10B981" : category.score >= 70 ? "#06B6D4" : "#F59E0B" }}
                  >
                    {category.score}
                  </span>
                </div>
                <div className="h-2 bg-[#1A1A2E] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${category.score}%` }}
                    transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Badges earned */}
      <div className="px-6 mb-6">
        <h2 className="text-lg font-semibold text-[#F1F5F9] mb-4">Badges ganados</h2>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {badges.map((badge, index) => (
            <motion.div
              key={badge.id}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.5 + index * 0.1 }}
              className="flex-shrink-0 w-28 glass rounded-xl p-4 text-center"
            >
              <div 
                className="w-12 h-12 mx-auto rounded-xl flex items-center justify-center mb-2"
                style={{ backgroundColor: badge.color }}
              >
                <Award className="w-6 h-6 text-[#F1F5F9]" />
              </div>
              <p className="text-[#F1F5F9] text-xs font-medium mb-1">{badge.name}</p>
              <p className="text-[#475569] text-xs">{badge.company}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* AI Feedback */}
      <div className="px-6 mb-6">
        <h2 className="text-lg font-semibold text-[#F1F5F9] mb-4">Feedback de la IA</h2>
        <div className="glass rounded-2xl p-4">
          <p className="text-[#F1F5F9] text-sm leading-relaxed mb-4">
            Mostraste excelentes habilidades de comunicacion durante la entrevista. 
            Tu respuesta sobre la priorizacion del bug demostro buen criterio tecnico. 
            Se noto confianza en tus respuestas sobre trabajo en equipo.
          </p>
          
          <div className="border-t border-[rgba(255,255,255,0.1)] pt-4">
            <p className="text-[#94A3B8] text-xs mb-2">Tips de mejora:</p>
            <ul className="space-y-2">
              {tips.map((tip, index) => (
                <li key={index} className="flex items-start gap-2 text-[#94A3B8] text-sm">
                  <span className="text-[#7C3AED]">•</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* XP earned */}
      <div className="px-6 mb-6">
        <div className="glass rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F59E0B]/20 flex items-center justify-center">
              <Zap className="w-5 h-5 text-[#F59E0B]" />
            </div>
            <div>
              <p className="text-[#F1F5F9] font-medium">+800 XP ganados</p>
              <p className="text-[#94A3B8] text-xs">+300 bonus por score mayor a 80%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="px-6 space-y-3">
        {/* Company wants to contact */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="p-4 rounded-2xl bg-gradient-to-r from-[#10B981]/20 to-[#06B6D4]/10 border border-[#10B981]/30"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-[#7C3AED] flex items-center justify-center text-[#F1F5F9] font-bold">
              T
            </div>
            <div className="flex-1">
              <p className="text-[#F1F5F9] font-medium">TechCorp quiere contactarte!</p>
              <p className="text-[#94A3B8] text-xs">Han visto tu perfil y reporte</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button className="flex-1 h-10 btn-primary-gradient text-[#F1F5F9] text-sm">
              Aceptar
            </Button>
            <Button variant="outline" className="flex-1 h-10 glass text-[#F1F5F9] text-sm">
              Ver mas tarde
            </Button>
          </div>
        </motion.div>

        {/* Share badge */}
        <Button
          variant="outline"
          className="w-full h-12 glass text-[#F1F5F9] font-medium flex items-center justify-center gap-2"
        >
          <Share2 className="w-4 h-4" />
          Compartir badge en LinkedIn
        </Button>

        {/* Talk to mentor */}
        <button
          type="button"
          onClick={() => openNova()}
          className="w-full flex items-center justify-between p-4 glass rounded-xl hover:bg-white/10 transition-colors"
        >
          <span className="text-[#94A3B8] text-sm">Hablar con Nova sobre tu reporte</span>
          <ChevronRight className="w-4 h-4 text-[#94A3B8]" />
        </button>
      </div>
    </div>
  )
}
