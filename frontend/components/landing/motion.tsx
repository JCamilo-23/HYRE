"use client"

import { motion, type HTMLMotionProps, useReducedMotion } from "framer-motion"
import { cn } from "@/lib/utils"

const ease = [0.22, 1, 0.36, 1] as const

export function FadeIn({
  children,
  className,
  delay = 0,
  y = 24,
  ...props
}: HTMLMotionProps<"div"> & { delay?: number; y?: number }) {
  const reduce = useReducedMotion()

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay, ease }}
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
  stagger = 0.08,
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
      viewport={{ once: true, margin: "-60px" }}
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
              hidden: { opacity: 0, y: 20 },
              show: { opacity: 1, y: 0, transition: { duration: 0.55, ease } },
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
    purple: "bg-[#7C3AED]/30",
    cyan: "bg-[#06B6D4]/25",
    green: "bg-[#10B981]/20",
    pink: "bg-[#EC4899]/20",
  }

  return (
    <div
      className={cn(
        "pointer-events-none absolute rounded-full blur-[120px]",
        colors[color],
        className,
      )}
      aria-hidden
    />
  )
}
