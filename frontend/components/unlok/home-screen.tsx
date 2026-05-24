"use client"

import { motion } from "framer-motion"
import { 
  Zap, 
  TrendingUp, 
  Trophy, 
  Target,
  Sparkles,
  ChevronRight,
  Bell
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { Screen } from "@/lib/hyre-types"

interface HomeScreenProps {
  onNavigate: (screen: Screen) => void
}

const quickActions = [
  {
    icon: Target,
    label: "Match",
    description: "Encuentra tu empresa ideal",
    screen: "match" as Screen,
    color: "bg-[var(--unlok-pink)]/20 text-[var(--unlok-pink)]",
  },
  {
    icon: Zap,
    label: "Simulacion",
    description: "Vive la experiencia laboral",
    screen: "simulation" as Screen,
    color: "bg-[var(--unlok-cyan)]/20 text-[var(--unlok-cyan)]",
  },
]

const stats = [
  { label: "Trust Score", value: "847", icon: TrendingUp, change: "+12" },
  { label: "XP Total", value: "2,450", icon: Sparkles, change: "+180" },
  { label: "Nivel", value: "7", icon: Trophy, change: "Pro" },
]

const recentActivity = [
  {
    title: "Match con TechCorp",
    description: "Completaste el match inicial",
    time: "Hace 2h",
    type: "match",
  },
  {
    title: "Simulacion completada",
    description: "Ganaste 120 XP en UX Design",
    time: "Hace 5h",
    type: "simulation",
  },
  {
    title: "Entrevista IA",
    description: "Tu comunicacion mejoro 15%",
    time: "Ayer",
    type: "interview",
  },
]

export function HomeScreen({ onNavigate }: HomeScreenProps) {
  return (
    <div className="min-h-screen pb-24 px-4 pt-6 safe-area-top">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-muted-foreground text-sm">Bienvenido de vuelta</p>
          <h1 className="text-2xl font-bold text-foreground">Carlos M.</h1>
        </div>
        <div className="flex items-center gap-3">
          <button className="relative w-10 h-10 rounded-full glass flex items-center justify-center">
            <Bell className="w-5 h-5 text-foreground" />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[var(--unlok-pink)] rounded-full" />
          </button>
          <button 
            onClick={() => onNavigate("profile")}
            className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-[var(--unlok-pink)] flex items-center justify-center text-white font-semibold"
          >
            C
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {stats.map((stat) => (
          <motion.div
            key={stat.label}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card className="glass p-3 border-0">
              <div className="flex items-center gap-1 mb-1">
                <stat.icon className="w-3.5 h-3.5 text-primary" />
                <span className="text-[10px] text-muted-foreground uppercase tracking-wide">
                  {stat.label}
                </span>
              </div>
              <p className="text-xl font-bold text-foreground">{stat.value}</p>
              <span className="text-xs text-[var(--unlok-green)]">{stat.change}</span>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <h2 className="text-lg font-semibold text-foreground mb-3">Acciones rapidas</h2>
      <div className="grid grid-cols-2 gap-3 mb-6">
        {quickActions.map((action) => (
          <motion.div
            key={action.label}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card
              className="glass p-4 border-0 cursor-pointer hover:bg-white/10 transition-colors"
              onClick={() => onNavigate(action.screen)}
            >
              <div className={`w-10 h-10 rounded-xl ${action.color} flex items-center justify-center mb-3`}>
                <action.icon className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-foreground">{action.label}</h3>
              <p className="text-xs text-muted-foreground mt-1">{action.description}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* AI Mentor Card */}
      <motion.div
        whileHover={{ scale: 1.01 }}
        className="mb-6"
      >
        <Card className="glass-strong p-4 border-0 bg-gradient-to-r from-primary/20 to-[var(--unlok-cyan)]/20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/30 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">Mentor IA</h3>
              <p className="text-sm text-muted-foreground">
                Tienes 3 tips nuevos para mejorar
              </p>
            </div>
            <Button size="sm" variant="secondary" className="rounded-xl">
              Ver
            </Button>
          </div>
        </Card>
      </motion.div>

      {/* Recent Activity */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-foreground">Actividad reciente</h2>
        <button className="text-sm text-primary flex items-center gap-1">
          Ver todo <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      <div className="space-y-3">
        {recentActivity.map((activity, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="glass p-4 border-0">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-foreground">{activity.title}</h4>
                  <p className="text-sm text-muted-foreground">{activity.description}</p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                  {activity.time}
                </span>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
