"use client"

import { useState } from "react"
import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion"
import { 
  MapPin, 
  Users, 
  Heart, 
  X, 
  Star,
  Building2,
  Briefcase,
  Clock
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const companies = [
  {
    id: 1,
    name: "TechCorp",
    industry: "Tecnologia",
    location: "Bogota, Colombia",
    employees: "500-1000",
    culture: ["Innovacion", "Flexibilidad", "Crecimiento"],
    description: "Startup de tecnologia enfocada en soluciones de IA para empresas.",
    matchScore: 94,
    openPositions: 12,
    gradient: "from-purple-600 to-blue-600",
  },
  {
    id: 2,
    name: "GreenFinance",
    industry: "Fintech",
    location: "Medellin, Colombia",
    employees: "100-500",
    culture: ["Sostenibilidad", "Impacto social", "Equipo joven"],
    description: "Fintech que democratiza el acceso a servicios financieros sostenibles.",
    matchScore: 89,
    openPositions: 8,
    gradient: "from-green-600 to-teal-600",
  },
  {
    id: 3,
    name: "CreativeHub",
    industry: "Marketing Digital",
    location: "Cali, Colombia",
    employees: "50-100",
    culture: ["Creatividad", "Trabajo remoto", "Diversidad"],
    description: "Agencia de marketing digital con clientes internacionales.",
    matchScore: 87,
    openPositions: 5,
    gradient: "from-pink-600 to-orange-600",
  },
]

export function MatchScreen() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [matchedCompanies, setMatchedCompanies] = useState<number[]>([])

  const x = useMotionValue(0)
  const rotate = useTransform(x, [-200, 200], [-15, 15])
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0.5, 1, 1, 1, 0.5])

  const likeOpacity = useTransform(x, [0, 100], [0, 1])
  const nopeOpacity = useTransform(x, [-100, 0], [1, 0])

  const handleDragEnd = (_: never, info: PanInfo) => {
    if (info.offset.x > 100) {
      handleLike()
    } else if (info.offset.x < -100) {
      handleNope()
    }
  }

  const handleLike = () => {
    setMatchedCompanies([...matchedCompanies, companies[currentIndex].id])
    goNext()
  }

  const handleNope = () => {
    goNext()
  }

  const goNext = () => {
    if (currentIndex < companies.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  const company = companies[currentIndex]

  if (currentIndex >= companies.length) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 pb-24">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-[var(--hyre-green)]/20 flex items-center justify-center mx-auto mb-4">
            <Heart className="w-10 h-10 text-[var(--hyre-green)]" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Sin mas empresas</h2>
          <p className="text-muted-foreground mb-6">
            Has visto todas las empresas disponibles. Tienes {matchedCompanies.length} matches.
          </p>
          <Button
            onClick={() => setCurrentIndex(0)}
            className="rounded-xl"
          >
            Ver de nuevo
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col px-4 pt-6 pb-24 safe-area-top">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-foreground">Match</h1>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass">
          <Heart className="w-4 h-4 text-[var(--hyre-pink)]" />
          <span className="text-sm font-medium text-foreground">{matchedCompanies.length}</span>
        </div>
      </div>

      {/* Card Stack */}
      <div className="flex-1 flex items-center justify-center relative">
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          onDragEnd={handleDragEnd}
          style={{ x, rotate, opacity }}
          className="absolute w-full cursor-grab active:cursor-grabbing"
        >
          <Card className="glass-strong border-0 overflow-hidden">
            {/* Company Header */}
            <div className={`h-40 bg-gradient-to-br ${company.gradient} relative`}>
              <div className="absolute inset-0 flex items-center justify-center">
                <Building2 className="w-16 h-16 text-white/30" />
              </div>
              
              {/* Like/Nope indicators */}
              <motion.div
                style={{ opacity: likeOpacity }}
                className="absolute top-4 left-4 px-4 py-2 rounded-lg border-4 border-[var(--hyre-green)] bg-[var(--hyre-green)]/20 rotate-[-15deg]"
              >
                <span className="text-[var(--hyre-green)] font-bold text-xl">LIKE</span>
              </motion.div>
              <motion.div
                style={{ opacity: nopeOpacity }}
                className="absolute top-4 right-4 px-4 py-2 rounded-lg border-4 border-destructive bg-destructive/20 rotate-[15deg]"
              >
                <span className="text-destructive font-bold text-xl">NOPE</span>
              </motion.div>

              {/* Match Score */}
              <div className="absolute bottom-4 right-4 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-sm flex items-center gap-1.5">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span className="text-white font-semibold">{company.matchScore}% match</span>
              </div>
            </div>

            {/* Company Info */}
            <div className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h2 className="text-xl font-bold text-foreground">{company.name}</h2>
                  <p className="text-primary font-medium">{company.industry}</p>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground text-sm">
                  <Briefcase className="w-4 h-4" />
                  <span>{company.openPositions} vacantes</span>
                </div>
              </div>

              <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                {company.description}
              </p>

              {/* Details */}
              <div className="flex flex-wrap gap-2 mb-4">
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>{company.location}</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span>{company.employees} empleados</span>
                </div>
              </div>

              {/* Culture Tags */}
              <div className="flex flex-wrap gap-2">
                {company.culture.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-center gap-6 pt-4">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleNope}
          className="w-16 h-16 rounded-full glass flex items-center justify-center border-2 border-destructive/30"
        >
          <X className="w-8 h-8 text-destructive" />
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleLike}
          className="w-20 h-20 rounded-full bg-[var(--hyre-green)] flex items-center justify-center glow-accent"
        >
          <Heart className="w-10 h-10 text-white" />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="w-16 h-16 rounded-full glass flex items-center justify-center border-2 border-primary/30"
        >
          <Star className="w-8 h-8 text-primary" />
        </motion.button>
      </div>

      {/* Hint */}
      <p className="text-center text-xs text-muted-foreground mt-4">
        <Clock className="w-3 h-3 inline mr-1" />
        Desliza para hacer match o rechazar
      </p>
    </div>
  )
}
