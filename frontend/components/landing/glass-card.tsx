"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface GlassCardProps {
  children: React.ReactNode
  className?: string
  glow?: boolean
  hover?: boolean
  borderGlow?: boolean
}

export function GlassCard({
  children,
  className,
  glow = false,
  hover = true,
  borderGlow = false,
}: GlassCardProps) {
  return (
    <motion.div
      whileHover={hover ? { y: -6, scale: 1.015 } : undefined}
      transition={{ type: "spring", stiffness: 380, damping: 26 }}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl",
        glow && "shadow-[0_0_60px_rgba(124,58,237,0.18)]",
        borderGlow &&
          "before:absolute before:inset-0 before:rounded-2xl before:p-[1px] before:content-[''] before:bg-gradient-to-br before:from-[#7C3AED]/50 before:via-transparent before:to-[#06B6D4]/40 before:opacity-0 before:transition-opacity before:duration-500 group-hover:before:opacity-100",
        hover && "hover:border-white/20 hover:bg-white/[0.06]",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.09] via-transparent to-transparent opacity-70"
        aria-hidden
      />
      <div className="relative z-10">{children}</div>
    </motion.div>
  )
}
