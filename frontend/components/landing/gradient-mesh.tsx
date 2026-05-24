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
  const smoothX = useSpring(mouseX, { stiffness: 60, damping: 20 })
  const smoothY = useSpring(mouseY, { stiffness: 60, damping: 20 })
  const x = useTransform(smoothX, (v) => `${v * 100}%`)
  const y = useTransform(smoothY, (v) => `${v * 100}%`)

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouseX.set(e.clientX / window.innerWidth)
      mouseY.set(e.clientY / window.innerHeight)
    }
    window.addEventListener("mousemove", onMove)
    return () => window.removeEventListener("mousemove", onMove)
  }, [mouseX, mouseY])

  const background = useMotionTemplate`radial-gradient(900px circle at ${x} ${y}, rgba(124,58,237,0.22), transparent 55%), radial-gradient(700px circle at calc(100% - ${x}) calc(100% - ${y}), rgba(6,182,212,0.18), transparent 50%), linear-gradient(180deg, #0a0614 0%, #0f0a1f 45%, #0a0614 100%)`

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <motion.div className="absolute inset-0" style={{ background }} />
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.04]" />
      <GlowOrb className="left-1/2 top-[-10%] h-[520px] w-[520px] -translate-x-1/2" color="purple" />
      <GlowOrb className="right-[-5%] top-[30%] h-[380px] w-[380px]" color="cyan" />
      <GlowOrb className="bottom-[-5%] left-[-5%] h-[320px] w-[320px]" color="green" />
      <Particles count={36} />
    </div>
  )
}
