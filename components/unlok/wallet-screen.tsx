"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft,
  Gift,
  CreditCard,
  TrendingUp,
  ChevronRight,
  Lock,
  Sparkles,
  QrCode
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const transactions = [
  {
    id: 1,
    type: "reward",
    title: "Simulacion completada",
    description: "TechCorp - UX Designer",
    amount: "+$25.000",
    date: "Hoy",
    icon: Gift,
    color: "text-[var(--unlok-green)]",
  },
  {
    id: 2,
    type: "reward",
    title: "Bonus Trust Score",
    description: "Llegaste a 800 puntos",
    amount: "+$15.000",
    date: "Ayer",
    icon: TrendingUp,
    color: "text-[var(--unlok-green)]",
  },
  {
    id: 3,
    type: "withdrawal",
    title: "Retiro a Nequi",
    description: "****4532",
    amount: "-$30.000",
    date: "Hace 3 dias",
    icon: ArrowUpRight,
    color: "text-[var(--unlok-pink)]",
  },
  {
    id: 4,
    type: "reward",
    title: "Entrevista IA",
    description: "Feedback positivo",
    amount: "+$10.000",
    date: "Hace 5 dias",
    icon: Sparkles,
    color: "text-[var(--unlok-green)]",
  },
]

const rewards = [
  {
    id: 1,
    title: "Curso premium",
    description: "Acceso a Platzi por 1 mes",
    cost: 500,
    icon: "🎓",
    available: true,
  },
  {
    id: 2,
    title: "Gift Card Rappi",
    description: "$20.000 en creditos",
    cost: 300,
    icon: "🛵",
    available: true,
  },
  {
    id: 3,
    title: "Certificacion IA",
    description: "Google Cloud AI",
    cost: 1000,
    icon: "🏆",
    available: false,
  },
]

export function WalletScreen() {
  const [activeTab, setActiveTab] = useState<"balance" | "rewards">("balance")
  const balance = 85000
  const trustScore = 847
  const availableXP = 450

  return (
    <div className="min-h-screen px-4 pt-6 pb-24 safe-area-top">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Wallet</h1>
        <button className="w-10 h-10 rounded-full glass flex items-center justify-center">
          <QrCode className="w-5 h-5 text-foreground" />
        </button>
      </div>

      {/* Balance Card */}
      <Card className="glass-strong border-0 overflow-hidden mb-6">
        <div className="bg-gradient-to-br from-primary via-primary/80 to-[var(--unlok-pink)] p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-white/70" />
              <span className="text-white/70 text-sm">Balance disponible</span>
            </div>
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-white/20">
              <Lock className="w-3 h-3 text-white" />
              <span className="text-white text-xs">Seguro</span>
            </div>
          </div>
          <h2 className="text-4xl font-bold text-white mb-1">
            ${balance.toLocaleString('es-CO')}
          </h2>
          <p className="text-white/60 text-sm">COP</p>
          
          {/* Trust Score indicator */}
          <div className="mt-4 pt-4 border-t border-white/20 flex items-center justify-between">
            <div>
              <p className="text-white/60 text-xs">Trust Score</p>
              <p className="text-white font-semibold">{trustScore} pts</p>
            </div>
            <div>
              <p className="text-white/60 text-xs">XP disponible</p>
              <p className="text-white font-semibold">{availableXP} XP</p>
            </div>
            <div>
              <p className="text-white/60 text-xs">Nivel credito</p>
              <p className="text-[var(--unlok-green)] font-semibold">Alto</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="p-4 flex gap-3">
          <Button className="flex-1 rounded-xl h-12" variant="secondary">
            <ArrowDownLeft className="w-4 h-4 mr-2" />
            Recibir
          </Button>
          <Button className="flex-1 rounded-xl h-12">
            <ArrowUpRight className="w-4 h-4 mr-2" />
            Retirar
          </Button>
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveTab("balance")}
          className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${
            activeTab === "balance"
              ? "bg-primary text-primary-foreground"
              : "glass text-muted-foreground"
          }`}
        >
          Movimientos
        </button>
        <button
          onClick={() => setActiveTab("rewards")}
          className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${
            activeTab === "rewards"
              ? "bg-primary text-primary-foreground"
              : "glass text-muted-foreground"
          }`}
        >
          Recompensas
        </button>
      </div>

      {activeTab === "balance" ? (
        /* Transactions */
        <div className="space-y-3">
          {transactions.map((tx, index) => (
            <motion.div
              key={tx.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="glass border-0 p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl glass flex items-center justify-center`}>
                    <tx.icon className={`w-5 h-5 ${tx.color}`} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground">{tx.title}</h4>
                    <p className="text-sm text-muted-foreground">{tx.description}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${tx.color}`}>{tx.amount}</p>
                    <p className="text-xs text-muted-foreground">{tx.date}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
          
          <button className="w-full py-3 text-sm text-primary flex items-center justify-center gap-1">
            Ver historial completo <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        /* Rewards */
        <div className="space-y-3">
          <Card className="glass-strong border-0 p-4 bg-gradient-to-r from-primary/20 to-[var(--unlok-cyan)]/20">
            <div className="flex items-center gap-3">
              <div className="text-3xl">🎁</div>
              <div className="flex-1">
                <h4 className="font-semibold text-foreground">XP disponible para canjear</h4>
                <p className="text-2xl font-bold text-primary">{availableXP} XP</p>
              </div>
            </div>
          </Card>

          {rewards.map((reward, index) => (
            <motion.div
              key={reward.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`glass border-0 p-4 ${!reward.available ? 'opacity-60' : ''}`}>
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{reward.icon}</div>
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground">{reward.title}</h4>
                    <p className="text-sm text-muted-foreground">{reward.description}</p>
                  </div>
                  <Button 
                    size="sm" 
                    variant={reward.available ? "default" : "secondary"}
                    className="rounded-xl"
                    disabled={!reward.available || availableXP < reward.cost}
                  >
                    {reward.cost} XP
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Connected Cards */}
      <div className="mt-6">
        <h3 className="font-semibold text-foreground mb-3">Metodos de retiro</h3>
        <Card className="glass border-0 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E6007A]/20 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-[#E6007A]" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-foreground">Nequi</h4>
              <p className="text-sm text-muted-foreground">****4532</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </div>
        </Card>
        <Button variant="outline" className="w-full mt-3 rounded-xl">
          Agregar metodo de pago
        </Button>
      </div>
    </div>
  )
}
