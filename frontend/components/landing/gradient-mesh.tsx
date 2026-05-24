"use client"

import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion"
import { useEffect } from "react"
import { Particles } from "@/components/landing/particles"
import { GlowOrb } from "@/components/landing/motion"

export function GradientMesh() {
  const mouseX = useMotionValue(0.5)
  const mouseY = useMotionValue(0.5)
  const smoothX = useSpring(mouseX, { stiffness: 50, damping: 22 })
  const smoothY = useSpring(mouseY, { stiffness: 50, damping: 22 })
  const x = useTransform(smoothX, (v) => `${v * 100}%`)
  const y = useTransform(smoothY, (v) => `${v * 100}%`)

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouseX.set(e.clientX / window.innerWidth)
      mouseY.set(e.clientY / window.innerHeight)
    }
    window.addEventListener("mousemove", onMove, { passive: true })
    return () => window.removeEventListener("mousemove", onMove)
  }, [mouseX, mouseY])

  const background = useMotionTemplate`
    radial-gradient(1000px circle at ${x} ${y}, rgba(124,58,237,0.26), transparent 52%),
    radial-gradient(800px circle at calc(100% - ${x}) calc(20% + ${y}), rgba(6,182,212,0.2), transparent 48%),
    radial-gradient(600px circle at 50% 100%, rgba(16,185,129,0.08), transparent 50%),
    linear-gradient(180deg, #06030f 0%, #0a0614 40%, #0f0a1f 70%, #06030f 100%)
  `

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <motion.div className="absolute inset-0" style={{ background }} />
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.045]" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      <GlowOrb className="left-1/2 top-[-12%] h-[560px] w-[560px] -translate-x-1/2" color="purple" />
      <GlowOrb className="right-[-8%] top-[28%] h-[420px] w-[420px]" color="cyan" />
      <GlowOrb className="bottom-[-8%] left-[-6%] h-[360px] w-[360px]" color="green" />
      <Particles count={48} />
    </div>
  )
}
