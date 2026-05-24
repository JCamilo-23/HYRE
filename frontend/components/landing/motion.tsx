"use client"

import { motion, type HTMLMotionProps, useReducedMotion } from "framer-motion"
import { cn } from "@/lib/utils"

export const easeOutExpo = [0.22, 1, 0.36, 1] as const

export function FadeIn({
  children,
  className,
  delay = 0,
  y = 28,
  ...props
}: HTMLMotionProps<"div"> & { delay?: number; y?: number }) {
  const reduce = useReducedMotion()

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-72px" }}
      transition={{ duration: 0.75, delay, ease: easeOutExpo }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export function Stagger({
  children,
  className,
  stagger = 0.09,
}: {
  children: React.ReactNode
  className?: string
  stagger?: number
}) {
  const reduce = useReducedMotion()

  return (
    <motion.div
      initial={reduce ? false : "hidden"}
      whileInView={reduce ? undefined : "show"}
      viewport={{ once: true, margin: "-48px" }}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: stagger } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  const reduce = useReducedMotion()

  return (
    <motion.div
      variants={
        reduce
          ? undefined
          : {
              hidden: { opacity: 0, y: 24, scale: 0.98 },
              show: {
                opacity: 1,
                y: 0,
                scale: 1,
                transition: { duration: 0.6, ease: easeOutExpo },
              },
            }
      }
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function GlowOrb({
  className,
  color = "purple",
}: {
  className?: string
  color?: "purple" | "cyan" | "green" | "pink"
}) {
  const colors = {
    purple: "bg-[#7C3AED]/35",
    cyan: "bg-[#06B6D4]/28",
    green: "bg-[#10B981]/22",
    pink: "bg-[#EC4899]/22",
  }

  return (
    <motion.div
      className={cn(
        "pointer-events-none absolute rounded-full blur-[120px]",
        colors[color],
        className,
      )}
      animate={{ opacity: [0.35, 0.55, 0.35], scale: [1, 1.08, 1] }}
      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      aria-hidden
    />
  )
}
