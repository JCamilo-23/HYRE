"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from "framer-motion"
import {
  X,
  Heart,
  Star,
  MapPin,
  Clock,
  Loader2,
  Users,
  Laptop,
  ChevronDown,
  Sparkles
} from "lucide-react"
import { Screen } from "@/lib/hyre-types"
import { MATCH_COMPANIES, type MatchCompany } from "@/lib/match-companies"
import { useLikedCompaniesStore } from "@/store/liked-companies-store"

interface MatchScreenProps {
  onNavigate: (screen: Screen) => void
}

export function MatchScreen({ onNavigate }: MatchScreenProps) {
  const addLike = useLikedCompaniesStore((s) => s.addLike)
  const [cards, setCards] = useState<MatchCompany[]>([])
  const [loading, setLoading] = useState(true)
  const [showMatch, setShowMatch] = useState(false)
  const [matchedCompany, setMatchedCompany] = useState<MatchCompany | null>(null)
  const [expandedCard, setExpandedCard] = useState(false)

  useEffect(() => {
    setCards(MATCH_COMPANIES)
    setLoading(false)
  }, [])

  const handleSwipe = (direction: "left" | "right" | "up", company: MatchCompany) => {
    if (direction === "right" || direction === "up") {
      addLike(company)
      setMatchedCompany(company)
      setShowMatch(true)
    }
    setTimeout(() => {
      setCards((prev) => prev.filter((c) => c.id !== company.id))
    }, 200)
  }

  const handleAction = (action: "reject" | "like" | "superlike") => {
    if (cards.length === 0) return
    const company = cards[0]
    if (action === "like" || action === "superlike") {
      addLike(company)
      setMatchedCompany(company)
      setShowMatch(true)
    }
    setCards((prev) => prev.slice(1))
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#7C3AED] animate-spin" />
      </div>
    )
  }

  const currentCard = cards[0]

  return (
    <div className="min-h-screen pb-24 safe-area-top">
      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <h1 className="text-2xl font-semibold text-[#F1F5F9] mb-1">Descubre empresas</h1>
        <p className="text-[#94A3B8] text-sm">Desliza para encontrar tu match perfecto</p>
      </div>

      {/* Card stack */}
      <div className="relative h-[480px] px-6">
        <AnimatePresence>
          {cards.length > 0 ? (
            cards.slice(0, 3).map((company, index) => (
              <SwipeCard
                key={company.id}
                company={company}
                index={index}
                onSwipe={(dir) => handleSwipe(dir, company)}
                isTop={index === 0}
                expanded={expandedCard && index === 0}
                onToggleExpand={() => setExpandedCard(!expandedCard)}
              />
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 flex flex-col items-center justify-center glass rounded-3xl"
            >
              <div className="w-20 h-20 rounded-full bg-[#1A1A2E] flex items-center justify-center mb-4">
                <Sparkles className="w-10 h-10 text-[#7C3AED]" />
              </div>
              <p className="text-[#F1F5F9] font-medium text-lg mb-2">Por ahora no hay mas empresas</p>
              <p className="text-[#94A3B8] text-sm text-center max-w-xs">
                Completa tu perfil para mejorar tus matches
              </p>
              <button 
                onClick={() => onNavigate("profile")}
                className="mt-4 px-6 py-2 btn-primary-gradient text-[#F1F5F9] text-sm font-medium rounded-xl"
              >
                Mejorar mi perfil
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Action buttons */}
      {cards.length > 0 && (
        <div className="flex items-center justify-center gap-6 mt-6 px-6">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => handleAction("reject")}
            className="w-16 h-16 rounded-full glass flex items-center justify-center hover:bg-[#EF4444]/20 transition-colors"
          >
            <X className="w-8 h-8 text-[#EF4444]" />
          </motion.button>
          
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => handleAction("superlike")}
            className="w-14 h-14 rounded-full bg-[#F59E0B] flex items-center justify-center shadow-lg shadow-[#F59E0B]/30"
          >
            <Star className="w-7 h-7 text-[#0A0A12]" fill="#0A0A12" />
          </motion.button>
          
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => handleAction("like")}
            className="w-16 h-16 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#06B6D4] flex items-center justify-center shadow-lg shadow-[#7C3AED]/30"
          >
            <Heart className="w-8 h-8 text-[#F1F5F9]" fill="#F1F5F9" />
          </motion.button>
        </div>
      )}

      {/* Match celebration modal */}
      <AnimatePresence>
        {showMatch && matchedCompany && (
          <MatchModal 
            company={matchedCompany} 
            onClose={() => setShowMatch(false)}
            onSimulation={() => {
              setShowMatch(false)
              onNavigate("simulation")
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function SwipeCard({ 
  company, 
  index, 
  onSwipe, 
  isTop,
  expanded,
  onToggleExpand
}: { 
  company: MatchCompany
  index: number
  onSwipe: (direction: "left" | "right" | "up") => void
  isTop: boolean
  expanded: boolean
  onToggleExpand: () => void
}) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  
  const rotate = useTransform(x, [-200, 200], [-20, 20])
  const likeOpacity = useTransform(x, [0, 100], [0, 1])
  const nopeOpacity = useTransform(x, [-100, 0], [1, 0])
  const superlikeOpacity = useTransform(y, [-100, 0], [1, 0])

  const handleDragEnd = (_: any, info: PanInfo) => {
    const threshold = 100
    
    if (info.offset.x > threshold) {
      onSwipe("right")
    } else if (info.offset.x < -threshold) {
      onSwipe("left")
    } else if (info.offset.y < -threshold) {
      onSwipe("up")
    }
  }

  return (
    <motion.div
      className="absolute inset-0"
      style={{
        x: isTop ? x : 0,
        y: isTop ? y : 0,
        rotate: isTop ? rotate : 0,
        scale: 1 - index * 0.05,
        zIndex: 10 - index,
      }}
      drag={isTop}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.8}
      onDragEnd={handleDragEnd}
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ 
        scale: 1 - index * 0.05, 
        opacity: 1,
        y: index * 8,
      }}
      exit={{ 
        x: 300, 
        opacity: 0,
        transition: { duration: 0.2 }
      }}
    >
      <div 
        className={`h-full rounded-3xl overflow-hidden glass-strong relative bg-gradient-to-br ${company.bgGradient}`}
        onClick={isTop ? onToggleExpand : undefined}
      >
        {/* Like/Nope/Superlike indicators */}
        {isTop && (
          <>
            <motion.div
              style={{ opacity: likeOpacity }}
              className="absolute top-8 left-8 z-10 px-4 py-2 rounded-xl bg-[#10B981] border-2 border-[#10B981]"
            >
              <span className="text-[#F1F5F9] font-bold text-xl">LIKE</span>
            </motion.div>
            <motion.div
              style={{ opacity: nopeOpacity }}
              className="absolute top-8 right-8 z-10 px-4 py-2 rounded-xl bg-[#EF4444] border-2 border-[#EF4444]"
            >
              <span className="text-[#F1F5F9] font-bold text-xl">NOPE</span>
            </motion.div>
            <motion.div
              style={{ opacity: superlikeOpacity }}
              className="absolute top-8 left-1/2 -translate-x-1/2 z-10 px-4 py-2 rounded-xl bg-[#F59E0B] border-2 border-[#F59E0B]"
            >
              <span className="text-[#0A0A12] font-bold text-xl">SUPER LIKE</span>
            </motion.div>
          </>
        )}

        {/* Match percentage badge */}
        <div className="absolute top-4 right-4 z-10">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="px-3 py-1.5 rounded-full bg-[#0A0A12]/80 backdrop-blur-sm flex items-center gap-1"
          >
            <span className="text-[#10B981] font-bold text-lg">{company.match}%</span>
            <span className="text-[#94A3B8] text-xs">match</span>
          </motion.div>
        </div>

        {/* Company content */}
        <div className="absolute inset-0 flex flex-col justify-end p-6">
          {/* Logo */}
          <div 
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-[#F1F5F9] mb-4 shadow-lg"
            style={{ backgroundColor: company.color }}
          >
            {company.logo}
          </div>

          {/* Company info */}
          <h2 className="text-2xl font-semibold text-[#F1F5F9] mb-1">{company.name}</h2>
          <p className="text-[#94A3B8] text-sm mb-3">{company.industry}</p>

          {/* Culture chips */}
          <div className="flex flex-wrap gap-2 mb-4">
            {company.culture.slice(0, 3).map((trait) => (
              <span key={trait} className="px-3 py-1 rounded-full bg-[#F1F5F9]/10 text-[#F1F5F9] text-xs">
                {trait}
              </span>
            ))}
          </div>

          {/* Vacancy */}
          <div className="glass rounded-xl p-3 mb-4">
            <p className="text-[#F1F5F9] font-medium">{company.vacancy}</p>
            <div className="flex items-center gap-4 mt-2 text-[#94A3B8] text-xs">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {company.location}
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {company.size}
              </span>
            </div>
          </div>

          {/* Quick benefits */}
          <div className="flex gap-2">
            {company.benefits.includes("Trabajo remoto") && (
              <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#7C3AED]/20 text-[#7C3AED] text-xs">
                <Laptop className="w-3 h-3" />
                Remoto
              </span>
            )}
            {company.benefits.includes("Horario flexible") && (
              <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#06B6D4]/20 text-[#06B6D4] text-xs">
                <Clock className="w-3 h-3" />
                Flexible
              </span>
            )}
          </div>

          {/* Expand indicator */}
          <div className="flex justify-center mt-4">
            <ChevronDown className={`w-5 h-5 text-[#94A3B8] transition-transform ${expanded ? "rotate-180" : ""}`} />
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function MatchModal({ 
  company, 
  onClose,
  onSimulation
}: { 
  company: MatchCompany
  onClose: () => void
  onSimulation: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A0A12]/90 backdrop-blur-sm px-6"
    >
      {/* Confetti effect */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-3 h-3 rounded-full"
          style={{
            backgroundColor: ["#7C3AED", "#06B6D4", "#10B981", "#F59E0B"][i % 4],
            left: `${Math.random() * 100}%`,
          }}
          initial={{ y: -100, opacity: 1 }}
          animate={{ 
            y: "100vh", 
            opacity: 0,
            rotate: Math.random() * 720,
          }}
          transition={{ 
            duration: 2 + Math.random(), 
            delay: Math.random() * 0.5,
            ease: "easeIn"
          }}
        />
      ))}

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="w-full max-w-sm glass-strong rounded-3xl p-6 text-center"
      >
        {/* Glow effect */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[#7C3AED]/20 to-[#06B6D4]/20 blur-xl -z-10" />

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.2 }}
          className="w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center text-3xl font-bold text-[#F1F5F9]"
          style={{ backgroundColor: company.color }}
        >
          {company.logo}
        </motion.div>

        <motion.h2
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-2xl font-bold text-[#F1F5F9] mb-2"
        >
          Match con {company.name}!
        </motion.h2>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-[#94A3B8] mb-6"
        >
          {company.match}% de compatibilidad
        </motion.p>

        <div className="flex flex-col gap-3">
          <button
            onClick={onSimulation}
            className="w-full h-12 btn-primary-gradient text-[#F1F5F9] font-medium rounded-xl"
          >
            Iniciar simulacion ahora
          </button>
          <button
            onClick={onClose}
            className="w-full h-12 glass text-[#F1F5F9] font-medium rounded-xl hover:bg-white/10"
          >
            Ver mas tarde
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
