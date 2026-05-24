"use client"

import { motion } from "framer-motion"
import { 
  Bell, 
  Sparkles, 
  Target, 
  Video, 
  MessageSquare, 
  ChevronRight,
  Zap,
  Trophy,
  TrendingUp,
} from "lucide-react"
import { Screen, UserData } from "@/lib/hyre-types"

interface HomeScreenProps {
  onNavigate: (screen: Screen) => void
  userData: UserData
}

const quickCards = [
  {
    id: "matches",
    title: "3 matches nuevos",
    subtitle: "Empresas te esperan",
    icon: Target,
    color: "#7C3AED",
    screen: "match" as Screen,
  },
  {
    id: "simulation",
    title: "Simulacion activa",
    subtitle: "2 retos pendientes",
    icon: Sparkles,
    color: "#06B6D4",
    screen: "simulation" as Screen,
  },
  {
    id: "interview",
    title: "Entrevista lista",
    subtitle: "TechCorp Colombia",
    icon: Video,
    color: "#10B981",
    screen: "interview" as Screen,
  },
  {
    id: "mentor",
    title: "Consejo de Nova",
    subtitle: "Tu mentor IA",
    icon: MessageSquare,
    color: "#F59E0B",
    screen: "mentor" as Screen,
  },
]

const recommendedCompanies = [
  {
    id: 1,
    name: "TechCorp",
    industry: "Tecnologia",
    match: 94,
    vacancy: "Desarrollador Frontend",
    logo: "T",
    color: "#7C3AED",
  },
  {
    id: 2,
    name: "DesignLab",
    industry: "Diseno",
    match: 89,
    vacancy: "UX Designer",
    logo: "D",
    color: "#06B6D4",
  },
  {
    id: 3,
    name: "StartupXYZ",
    industry: "Fintech",
    match: 87,
    vacancy: "Product Manager",
    logo: "S",
    color: "#10B981",
  },
]

const recentActivity = [
  { id: 1, action: "Completaste simulacion", company: "TechCorp", xp: "+500 XP", time: "Hace 2h" },
  { id: 2, action: "Nuevo badge", company: "Clear Communicator", xp: "+100 XP", time: "Hace 5h" },
  { id: 3, action: "Match con empresa", company: "DesignLab", xp: "+50 XP", time: "Ayer" },
]

export function HomeScreen({ onNavigate, userData }: HomeScreenProps) {
  const currentHour = new Date().getHours()
  const greeting = currentHour < 12 ? "Buenos dias" : currentHour < 18 ? "Buenas tardes" : "Buenas noches"
  
  // Obtener el primer nombre del usuario
  const firstName = userData.name ? userData.name.split(" ")[0] : "Usuario"

  return (
    <div className="min-h-screen pb-24 safe-area-top">
      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-[#94A3B8] text-sm">{greeting}</p>
            <h1 className="text-2xl font-semibold text-[#F1F5F9]">{firstName}</h1>
          </div>
          <div className="flex items-center gap-3">
            {/* XP indicator */}
            <div className="flex items-center gap-2 px-3 py-1.5 glass rounded-full">
              <Zap className="w-4 h-4 text-[#F59E0B]" />
              <span className="text-[#F1F5F9] text-sm font-medium">2,450 XP</span>
            </div>
            {/* Notification bell */}
            <button className="relative w-10 h-10 glass rounded-full flex items-center justify-center">
              <Bell className="w-5 h-5 text-[#F1F5F9]" />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#EF4444] rounded-full" />
            </button>
          </div>
        </div>

        {/* Level progress */}
        <div className="glass rounded-2xl p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-[#F59E0B]" />
              <span className="text-[#F1F5F9] font-medium">Nivel 3 - Rising Star</span>
            </div>
            <span className="text-[#94A3B8] text-sm">2,450 / 3,500 XP</span>
          </div>
          <div className="h-2 bg-[#1A1A2E] rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "70%" }}
              transition={{ duration: 1, delay: 0.3 }}
              className="h-full bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] rounded-full"
            />
          </div>
        </div>
      </div>

      {/* Quick action cards - horizontal scroll */}
      <div className="px-6 mb-8">
        <h2 className="text-lg font-semibold text-[#F1F5F9] mb-4">Resumen rapido</h2>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-6 px-6 scrollbar-hide">
          {quickCards.map((card, index) => {
            const Icon = card.icon
            return (
              <motion.button
                key={card.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => onNavigate(card.screen)}
                className="flex-shrink-0 w-40 p-4 glass rounded-2xl text-left hover:bg-white/10 transition-colors"
              >
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                  style={{ backgroundColor: `${card.color}20` }}
                >
                  <Icon className="w-5 h-5" style={{ color: card.color }} />
                </div>
                <p className="text-[#F1F5F9] font-medium text-sm mb-1">{card.title}</p>
                <p className="text-[#94A3B8] text-xs">{card.subtitle}</p>
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Recommended companies */}
      <div className="px-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[#F1F5F9]">Matches perfectos para ti</h2>
          <button 
            onClick={() => onNavigate("match")}
            className="text-[#7C3AED] text-sm font-medium flex items-center gap-1"
          >
            Ver todas
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="flex flex-col gap-3">
          {recommendedCompanies.map((company, index) => (
            <motion.button
              key={company.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              onClick={() => onNavigate("match")}
              className="w-full p-4 glass rounded-2xl flex items-center gap-4 text-left hover:bg-white/10 transition-colors"
            >
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold text-[#F1F5F9]"
                style={{ backgroundColor: company.color }}
              >
                {company.logo}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-[#F1F5F9] font-medium">{company.name}</p>
                  <span className="text-[#94A3B8] text-xs">{company.industry}</span>
                </div>
                <p className="text-[#94A3B8] text-sm">{company.vacancy}</p>
              </div>
              <div className="flex flex-col items-end">
                <span 
                  className="text-lg font-semibold"
                  style={{ color: company.match >= 90 ? "#10B981" : "#7C3AED" }}
                >
                  {company.match}%
                </span>
                <span className="text-[#475569] text-xs">match</span>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Recent activity */}
      <div className="px-6 mb-8">
        <h2 className="text-lg font-semibold text-[#F1F5F9] mb-4">Actividad reciente</h2>
        <div className="glass rounded-2xl overflow-hidden">
          {recentActivity.map((activity, index) => (
            <div
              key={activity.id}
              className={`p-4 flex items-center gap-3 ${
                index !== recentActivity.length - 1 ? "border-b border-[rgba(255,255,255,0.05)]" : ""
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-[#7C3AED]/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-[#7C3AED]" />
              </div>
              <div className="flex-1">
                <p className="text-[#F1F5F9] text-sm font-medium">{activity.action}</p>
                <p className="text-[#94A3B8] text-xs">{activity.company}</p>
              </div>
              <div className="text-right">
                <p className="text-[#10B981] text-sm font-medium">{activity.xp}</p>
                <p className="text-[#475569] text-xs">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mentor AI tip */}
      <div className="px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="p-4 rounded-2xl bg-gradient-to-br from-[#7C3AED]/20 to-[#06B6D4]/10 border border-[#7C3AED]/20"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#06B6D4] flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-[#F1F5F9]" />
            </div>
            <div className="flex-1">
              <p className="text-[#F1F5F9] font-medium mb-1">Consejo de Nova</p>
              <p className="text-[#94A3B8] text-sm leading-relaxed">
                Mejora tus habilidades en React para acceder a 12 empresas mas que buscan ese perfil.
              </p>
              <button 
                onClick={() => onNavigate("mentor")}
                className="text-[#7C3AED] text-sm font-medium mt-2 flex items-center gap-1"
              >
                Hablar con Nova
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
