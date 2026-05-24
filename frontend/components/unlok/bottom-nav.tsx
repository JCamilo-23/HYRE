"use client"

import { motion } from "framer-motion"
import { Home, Target, Zap, User, Wallet } from "lucide-react"
import type { Screen } from "@/lib/hyre-types"

interface BottomNavProps {
  currentScreen: Screen
  onNavigate: (screen: Screen) => void
}

const navItems = [
  { screen: "home" as Screen, icon: Home, label: "Inicio" },
  { screen: "match" as Screen, icon: Target, label: "Match" },
  { screen: "simulation" as Screen, icon: Zap, label: "Simular" },
  { screen: "wallet" as Screen, icon: Wallet, label: "Wallet" },
  { screen: "profile" as Screen, icon: User, label: "Perfil" },
]

export function BottomNav({ currentScreen, onNavigate }: BottomNavProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 safe-area-bottom">
      <div className="max-w-md mx-auto px-4 pb-2">
        <nav className="glass-strong rounded-2xl p-2 flex items-center justify-around">
          {navItems.map((item) => {
            const isActive = currentScreen === item.screen
            return (
              <button
                key={item.screen}
                onClick={() => onNavigate(item.screen)}
                className="relative flex flex-col items-center py-2 px-3 rounded-xl transition-colors"
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-primary/20 rounded-xl"
                    transition={{ type: "spring", duration: 0.5 }}
                  />
                )}
                <item.icon
                  className={`w-5 h-5 relative z-10 transition-colors ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`}
                />
                <span
                  className={`text-[10px] mt-1 relative z-10 transition-colors ${
                    isActive ? "text-primary font-medium" : "text-muted-foreground"
                  }`}
                >
                  {item.label}
                </span>
              </button>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
