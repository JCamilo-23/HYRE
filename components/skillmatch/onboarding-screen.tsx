"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FileText, Sparkles, Award, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface OnboardingScreenProps {
  onComplete: () => void
}

const slides = [
  {
    id: 1,
    icon: FileText,
    title: "El CV no dice quien eres realmente",
    subtitle: "67% de los jovenes no consigue trabajo por falta de experiencia",
    gradient: "from-[#EF4444]/20 to-[#F59E0B]/10",
    iconColor: "#EF4444",
  },
  {
    id: 2,
    icon: Sparkles,
    title: "Demuestra tus habilidades en accion",
    subtitle: "Simulaciones reales. Entrevistas con IA. Conexion genuina.",
    gradient: "from-[#7C3AED]/20 to-[#06B6D4]/10",
    iconColor: "#7C3AED",
  },
  {
    id: 3,
    icon: Award,
    title: "Tu talento vale mas que tu papel",
    subtitle: "Gana experiencia real aunque sea tu primera vez",
    gradient: "from-[#10B981]/20 to-[#06B6D4]/10",
    iconColor: "#10B981",
  },
]

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [currentSlide, setCurrentSlide] = useState(0)

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1)
    } else {
      onComplete()
    }
  }

  const handleSkip = () => {
    onComplete()
  }

  const slide = slides[currentSlide]
  const Icon = slide.icon

  return (
    <div className="min-h-screen flex flex-col px-6 py-8 safe-area-top safe-area-bottom">
      {/* Skip button */}
      <div className="flex justify-end">
        <button
          onClick={handleSkip}
          className="text-[#94A3B8] text-sm hover:text-[#F1F5F9] transition-colors"
        >
          Saltar
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center text-center"
          >
            {/* Illustration area */}
            <div className={`relative w-64 h-64 mb-12 rounded-3xl bg-gradient-to-br ${slide.gradient} flex items-center justify-center`}>
              <div className="absolute inset-0 glass rounded-3xl" />
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
              >
                <Icon 
                  className="w-24 h-24" 
                  style={{ color: slide.iconColor }}
                  strokeWidth={1.5}
                />
              </motion.div>
              
              {/* Decorative particles */}
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 rounded-full"
                  style={{ backgroundColor: slide.iconColor }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ 
                    opacity: [0, 0.6, 0],
                    scale: [0, 1, 0],
                    x: Math.cos(i * 60 * Math.PI / 180) * 80,
                    y: Math.sin(i * 60 * Math.PI / 180) * 80,
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity, 
                    delay: i * 0.3,
                    ease: "easeInOut"
                  }}
                />
              ))}
            </div>

            {/* Text */}
            <h1 className="text-2xl font-semibold text-[#F1F5F9] mb-4 leading-tight text-balance">
              {slide.title}
            </h1>
            <p className="text-[#94A3B8] text-base leading-relaxed max-w-xs">
              {slide.subtitle}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Progress dots */}
      <div className="flex justify-center gap-2 mb-8">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === currentSlide 
                ? "w-8 bg-[#7C3AED]" 
                : "w-2 bg-[#475569]"
            }`}
          />
        ))}
      </div>

      {/* Next/Start button */}
      <Button
        onClick={handleNext}
        className="w-full h-14 btn-primary-gradient text-[#F1F5F9] font-medium text-base flex items-center justify-center gap-2"
      >
        {currentSlide === slides.length - 1 ? "Comenzar" : "Siguiente"}
        <ChevronRight className="w-5 h-5" />
      </Button>
    </div>
  )
}
