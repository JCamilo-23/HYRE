"use client"

import { motion } from "framer-motion"
import { 
  Settings, 
  ChevronRight, 
  Award, 
  Briefcase,
  GraduationCap,
  Star,
  TrendingUp,
  Zap,
  Edit3,
  Share2,
  Shield,
  Video
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

const skills = [
  { name: "Diseno UX/UI", level: 78, color: "bg-primary" },
  { name: "Comunicacion", level: 85, color: "bg-[var(--hyre-green)]" },
  { name: "Liderazgo", level: 62, color: "bg-[var(--hyre-pink)]" },
  { name: "Trabajo en equipo", level: 90, color: "bg-[var(--hyre-cyan)]" },
]

const badges = [
  { icon: "🎯", name: "Primer match", unlocked: true },
  { icon: "🔥", name: "Racha 7 dias", unlocked: true },
  { icon: "💎", name: "Top performer", unlocked: true },
  { icon: "🚀", name: "Speed demon", unlocked: false },
  { icon: "🏆", name: "Champion", unlocked: false },
  { icon: "⭐", name: "All-star", unlocked: false },
]

const stats = [
  { label: "Simulaciones", value: "12", icon: Briefcase },
  { label: "Entrevistas IA", value: "8", icon: Video },
  { label: "Matches", value: "23", icon: Star },
]

export function ProfileScreen() {
  const trustScore = 847
  const level = 7
  const xpCurrent = 2450
  const xpNextLevel = 3000
  const xpProgress = (xpCurrent / xpNextLevel) * 100

  return (
    <div className="min-h-screen px-4 pt-6 pb-24 safe-area-top">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Perfil</h1>
        <button className="w-10 h-10 rounded-full glass flex items-center justify-center">
          <Settings className="w-5 h-5 text-foreground" />
        </button>
      </div>

      {/* Profile Card */}
      <Card className="glass-strong border-0 p-5 mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-[var(--hyre-pink)] flex items-center justify-center text-3xl font-bold text-white">
              C
            </div>
            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[var(--hyre-green)] flex items-center justify-center text-xs font-bold text-white border-2 border-background">
              {level}
            </div>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-foreground">Carlos Martinez</h2>
            <p className="text-muted-foreground text-sm">@carlosm_hyre</p>
            <div className="flex items-center gap-2 mt-1">
              <Shield className="w-4 h-4 text-[var(--hyre-green)]" />
              <span className="text-sm text-[var(--hyre-green)] font-medium">Verificado</span>
            </div>
          </div>
          <Button size="sm" variant="outline" className="rounded-xl">
            <Edit3 className="w-4 h-4" />
          </Button>
        </div>

        {/* Level Progress */}
        <div className="bg-secondary/50 rounded-xl p-3 mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">Nivel {level}</span>
            </div>
            <span className="text-xs text-muted-foreground">{xpCurrent} / {xpNextLevel} XP</span>
          </div>
          <Progress value={xpProgress} className="h-2" />
          <p className="text-xs text-muted-foreground mt-2">
            {xpNextLevel - xpCurrent} XP para nivel {level + 1}
          </p>
        </div>

        {/* Trust Score */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-[var(--hyre-green)]/20 to-[var(--hyre-cyan)]/20">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[var(--hyre-green)]/30 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-[var(--hyre-green)]" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Trust Score</p>
              <p className="text-2xl font-bold text-foreground">{trustScore}</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[var(--hyre-green)] text-sm font-medium">+12 esta semana</span>
            <p className="text-xs text-muted-foreground">Top 15%</p>
          </div>
        </div>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {stats.map((stat) => (
          <Card key={stat.label} className="glass border-0 p-3 text-center">
            <stat.icon className="w-5 h-5 text-primary mx-auto mb-1" />
            <p className="text-xl font-bold text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </Card>
        ))}
      </div>

      {/* Skills */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-foreground">Habilidades</h3>
          <button className="text-sm text-primary flex items-center gap-1">
            Ver analisis <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <Card className="glass border-0 p-4">
          <div className="space-y-4">
            {skills.map((skill) => (
              <div key={skill.name}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-foreground">{skill.name}</span>
                  <span className="text-sm font-medium text-foreground">{skill.level}%</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${skill.level}%` }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className={`h-full ${skill.color} rounded-full`}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Badges */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-foreground">Insignias</h3>
          <span className="text-sm text-muted-foreground">3/6 desbloqueadas</span>
        </div>
        <div className="grid grid-cols-6 gap-2">
          {badges.map((badge, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.1 }}
              className={`aspect-square rounded-xl flex items-center justify-center text-2xl ${
                badge.unlocked
                  ? 'glass-strong'
                  : 'bg-secondary/30 opacity-40 grayscale'
              }`}
            >
              {badge.icon}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Share Profile */}
      <Button variant="outline" className="w-full rounded-xl" size="lg">
        <Share2 className="w-4 h-4 mr-2" />
        Compartir perfil
      </Button>
    </div>
  )
}
