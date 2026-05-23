"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Sparkles, Target, Video, Users, ArrowRight, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface OnboardingScreenProps {
  onComplete: () => void
}

const slides = [
  {
    icon: Target,
    title: "Encuentra tu match",
    description: "HYRE conecta jovenes con empresas mediante match inteligente. Desliza y descubre oportunidades.",
    color: "from-primary to-primary/50",
  },
  {
    icon: Sparkles,
    title: "Simulaciones reales",
    description: "Vive la experiencia laboral antes de aplicar. Completa tareas y demuestra tu potencial.",
    color: "from-[var(--hyre-pink)] to-[var(--hyre-pink)]/50",
  },
  {
    icon: Video,
    title: "Entrevistas con IA",
    description: "Practica con nuestro entrevistador IA. Analiza tu comunicacion, confianza y lenguaje corporal.",
    color: "from-[var(--hyre-cyan)] to-[var(--hyre-cyan)]/50",
  },
  {
    icon: Users,
    title: "Mentor IA personal",
    description: "Recibe consejos personalizados, mejora tus habilidades y sube de nivel en tu carrera.",
    color: "from-[var(--hyre-green)] to-[var(--hyre-green)]/50",
  },
]

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [currentSlide, setCurrentSlide] = useState(0)

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1)
    } else {
      onComplete()
    }
  }

  const slide = slides[currentSlide]
  const Icon = slide.icon

  return (
    <div className="min-h-screen flex flex-col px-6 py-12 safe-area-top safe-area-bottom">
      {/* Skip button */}
      <div className="flex justify-end">
        <button
          onClick={onComplete}
          className="text-muted-foreground text-sm hover:text-foreground transition-colors"
        >
          Saltar
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center text-center"
        >
          {/* Icon */}
          <div className={`w-24 h-24 rounded-3xl bg-gradient-to-br ${slide.color} flex items-center justify-center mb-8 glow-primary`}>
            <Icon className="w-12 h-12 text-white" />
          </div>

          {/* Logo */}
          <h1 className="text-4xl font-bold tracking-tight mb-2">
            <span className="text-foreground">HY</span>
            <span className="text-primary">RE</span>
          </h1>

          {/* Title */}
          <h2 className="text-2xl font-semibold text-foreground mt-6 mb-4 text-balance">
            {slide.title}
          </h2>

          {/* Description */}
          <p className="text-muted-foreground text-base leading-relaxed max-w-xs text-pretty">
            {slide.description}
          </p>
        </motion.div>
      </div>

      {/* Progress indicators */}
      <div className="flex justify-center gap-2 mb-8">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === currentSlide
                ? "w-8 bg-primary"
                : "w-2 bg-muted hover:bg-muted-foreground"
            }`}
          />
        ))}
      </div>

      {/* Action button */}
      <Button
        onClick={nextSlide}
        size="lg"
        className="w-full h-14 text-base font-semibold rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground glow-primary"
      >
        {currentSlide === slides.length - 1 ? (
          <>
            Comenzar <ArrowRight className="w-5 h-5 ml-2" />
          </>
        ) : (
          <>
            Siguiente <ChevronRight className="w-5 h-5 ml-2" />
          </>
        )}
      </Button>
    </div>
  )
}
