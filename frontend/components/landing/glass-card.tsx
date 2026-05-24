"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface GlassCardProps {
  children: React.ReactNode
  className?: string
  glow?: boolean
  hover?: boolean
}

export function GlassCard({
  children,
  className,
  glow = false,
  hover = true,
}: GlassCardProps) {
  return (
    <motion.div
      whileHover={hover ? { y: -4, scale: 1.01 } : undefined}
      transition={{ type: "spring", stiffness: 400, damping: 28 }}
      className={cn(
        "relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl",
        glow && "shadow-[0_0_60px_rgba(124,58,237,0.15)]",
        hover && "hover:border-white/20 hover:bg-white/[0.06]",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.08] via-transparent to-transparent opacity-60"
        aria-hidden
      />
      <div className="relative z-10">{children}</div>
    </motion.div>
  )
}
