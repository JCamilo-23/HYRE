"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { User, Building2, Star, CheckCircle, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface UserTypeScreenProps {
  onSelect: (type: "candidate" | "company") => void
}

export function UserTypeScreen({ onSelect }: UserTypeScreenProps) {
  const [selected, setSelected] = useState<"candidate" | "company" | null>(null)

  const handleContinue = () => {
    if (selected) {
      onSelect(selected)
    }
  }

  return (
    <div className="min-h-screen flex flex-col px-6 py-8 safe-area-top safe-area-bottom">
      {/* Header */}
      <div className="text-center mb-12 mt-8">
        <h1 className="text-2xl font-semibold text-[#F1F5F9] mb-3">
          Como quieres usar HYRE?
        </h1>
        <p className="text-[#94A3B8] text-sm">
          Selecciona tu perfil para personalizar tu experiencia
        </p>
      </div>

      {/* Options */}
      <div className="flex-1 flex flex-col gap-4">
        {/* Candidate option */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => setSelected("candidate")}
          className={`relative p-6 rounded-2xl text-left transition-all duration-300 ${
            selected === "candidate"
              ? "glass-strong border-[#7C3AED] shadow-[0_0_30px_rgba(124,58,237,0.2)]"
              : "glass hover:border-[#475569]"
          }`}
          style={{
            borderColor: selected === "candidate" ? "#7C3AED" : "rgba(255,255,255,0.1)",
            borderWidth: "1px",
          }}
        >
          {/* Selected indicator */}
          {selected === "candidate" && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute top-4 right-4"
            >
              <CheckCircle className="w-6 h-6 text-[#7C3AED]" />
            </motion.div>
          )}

          <div className="flex items-start gap-4">
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
              selected === "candidate" 
                ? "bg-[#7C3AED]/20" 
                : "bg-[#1A1A2E]"
            }`}>
              <User className={`w-7 h-7 ${
                selected === "candidate" ? "text-[#7C3AED]" : "text-[#94A3B8]"
              }`} />
              <Star className={`w-4 h-4 absolute ml-8 -mt-4 ${
                selected === "candidate" ? "text-[#F59E0B]" : "text-[#475569]"
              }`} />
            </div>
            <div className="flex-1">
              <h3 className={`text-lg font-medium mb-1 ${
                selected === "candidate" ? "text-[#F1F5F9]" : "text-[#F1F5F9]"
              }`}>
                Busco trabajo
              </h3>
              <p className="text-[#94A3B8] text-sm leading-relaxed">
                Demuestra tus habilidades y conecta con empresas que valoran tu talento
              </p>
            </div>
          </div>

          {/* Features */}
          <div className="mt-4 flex flex-wrap gap-2">
            {["Simulaciones", "Entrevista IA", "Badges", "Mentor Nova"].map((feature) => (
              <span
                key={feature}
                className={`px-3 py-1 rounded-full text-xs ${
                  selected === "candidate"
                    ? "bg-[#7C3AED]/20 text-[#7C3AED]"
                    : "bg-[#1A1A2E] text-[#94A3B8]"
                }`}
              >
                {feature}
              </span>
            ))}
          </div>
        </motion.button>

        {/* Company option */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => setSelected("company")}
          className={`relative p-6 rounded-2xl text-left transition-all duration-300 ${
            selected === "company"
              ? "glass-strong border-[#06B6D4] shadow-[0_0_30px_rgba(6,182,212,0.2)]"
              : "glass hover:border-[#475569]"
          }`}
          style={{
            borderColor: selected === "company" ? "#06B6D4" : "rgba(255,255,255,0.1)",
            borderWidth: "1px",
          }}
        >
          {/* Selected indicator */}
          {selected === "company" && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute top-4 right-4"
            >
              <CheckCircle className="w-6 h-6 text-[#06B6D4]" />
            </motion.div>
          )}

          <div className="flex items-start gap-4">
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
              selected === "company" 
                ? "bg-[#06B6D4]/20" 
                : "bg-[#1A1A2E]"
            }`}>
              <Building2 className={`w-7 h-7 ${
                selected === "company" ? "text-[#06B6D4]" : "text-[#94A3B8]"
              }`} />
              <CheckCircle className={`w-4 h-4 absolute ml-8 -mt-4 ${
                selected === "company" ? "text-[#10B981]" : "text-[#475569]"
              }`} />
            </div>
            <div className="flex-1">
              <h3 className={`text-lg font-medium mb-1 ${
                selected === "company" ? "text-[#F1F5F9]" : "text-[#F1F5F9]"
              }`}>
                Necesitamos talentos
              </h3>
              <p className="text-[#94A3B8] text-sm leading-relaxed">
                Publica tu proyecto y conecta con candidatos evaluados por IA que encajan con tu cultura
              </p>
            </div>
          </div>

          {/* Features */}
          <div className="mt-4 flex flex-wrap gap-2">
            {["Reportes IA", "Aceptar candidatos", "Pipeline", "Vacantes"].map((feature) => (
              <span
                key={feature}
                className={`px-3 py-1 rounded-full text-xs ${
                  selected === "company"
                    ? "bg-[#06B6D4]/20 text-[#06B6D4]"
                    : "bg-[#1A1A2E] text-[#94A3B8]"
                }`}
              >
                {feature}
              </span>
            ))}
          </div>
        </motion.button>
      </div>

      {/* Continue button */}
      <Button
        onClick={handleContinue}
        disabled={!selected}
        className={`w-full h-14 font-medium text-base flex items-center justify-center gap-2 transition-all duration-300 ${
          selected
            ? "btn-primary-gradient text-[#F1F5F9]"
            : "bg-[#1A1A2E] text-[#475569] cursor-not-allowed"
        }`}
      >
        Continuar
        <ChevronRight className="w-5 h-5" />
      </Button>
    </div>
  )
}
