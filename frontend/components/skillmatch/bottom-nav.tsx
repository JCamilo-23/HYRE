"use client"

import { motion } from "framer-motion"
import { Home, Target, Sparkles, Video, User, Building2, ClipboardList } from "lucide-react"
import { Screen } from "@/lib/hyre-types"

interface BottomNavProps {
  currentScreen: Screen
  onNavigate: (screen: Screen) => void
  userType?: "candidate" | "company" | null
}

const candidateNavItems = [
  { id: "home" as Screen, label: "Inicio", icon: Home },
  { id: "match" as Screen, label: "Match", icon: Target },
  { id: "simulation" as Screen, label: "Simular", icon: Sparkles },
  { id: "interview" as Screen, label: "Entrevista", icon: Video },
  { id: "profile" as Screen, label: "Perfil", icon: User },
]

const employerNavItems = [
  { id: "employerHome" as Screen, label: "Inicio", icon: Building2 },
  { id: "employerCandidates" as Screen, label: "Reportes", icon: ClipboardList },
  { id: "profile" as Screen, label: "Empresa", icon: User },
]

export function BottomNav({ currentScreen, onNavigate, userType }: BottomNavProps) {
  const isEmployer = userType === "company"
  const navItems = isEmployer ? employerNavItems : candidateNavItems
  const accentColor = isEmployer ? "#06B6D4" : "#7C3AED"

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <div className="max-w-md mx-auto px-4 pb-2 safe-area-bottom">
        <nav className="glass rounded-2xl px-2 py-2">
          <div className="flex items-center justify-around">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive =
                currentScreen === item.id ||
                (item.id === "interview" && ["interview", "report"].includes(currentScreen))

              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className="relative flex flex-col items-center py-2 px-3 rounded-xl transition-colors"
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute inset-0 rounded-xl"
                      style={{ backgroundColor: `${accentColor}33` }}
                      transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                    />
                  )}
                  <Icon
                    className="w-5 h-5 relative z-10"
                    style={{ color: isActive ? accentColor : "#475569" }}
                  />
                  <span
                    className="text-xs mt-1 relative z-10"
                    style={{ color: isActive ? accentColor : "#475569" }}
                  >
                    {item.label}
                  </span>
                </button>
              )
            })}
          </div>
        </nav>
      </div>
    </div>
  )
}
