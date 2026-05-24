"use client"

import Link from "next/link"
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion"
import { ArrowRight, Play, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { GlassCard } from "@/components/landing/glass-card"
import { FadeIn } from "@/components/landing/motion"
import { heroStats } from "@/lib/landing/content"

const floatingCards = [
  { label: "Match IA", value: "94%", x: "-6%", y: "16%", delay: 0.25 },
  { label: "XP ganado", value: "+420", x: "76%", y: "10%", delay: 0.4 },
  { label: "Simulación", value: "Activa", x: "70%", y: "66%", delay: 0.55 },
]

export function HeroSection() {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [8, -8]), {
    stiffness: 120,
    damping: 22,
  })
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-10, 10]), {
    stiffness: 120,
    damping: 22,
  })

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5)
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5)
  }

  const onLeave = () => {
    mouseX.set(0)
    mouseY.set(0)
  }

  return (
    <section className="relative overflow-hidden pt-28 pb-24 sm:pt-36 sm:pb-28 lg:pb-36">
      <div className="pointer-events-none absolute inset-x-0 top-32 h-[480px] bg-gradient-to-b from-[#7C3AED]/10 via-transparent to-transparent" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-16 lg:grid-cols-2 lg:gap-12">
          <div className="relative z-10">
            <FadeIn>
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#7C3AED]/35 bg-[#7C3AED]/10 px-4 py-2 text-xs font-medium tracking-wide text-[#C4B5FD] backdrop-blur-md">
                <Sparkles className="h-3.5 w-3.5 animate-pulse text-[#9F67FF]" />
                La plataforma Gen Z de hiring con IA
              </div>
            </FadeIn>

            <FadeIn delay={0.06}>
              <h1 className="font-display text-[2.65rem] font-semibold leading-[1.02] tracking-tight text-white sm:text-5xl lg:text-6xl xl:text-[4.25rem]">
                Demuestra tu{" "}
                <span className="relative inline-block">
                  <span className="bg-gradient-to-r from-[#7C3AED] via-[#B794FF] to-[#06B6D4] bg-clip-text text-transparent hyre-shimmer">
                    potencial
                  </span>
                </span>
                <br className="hidden sm:block" />
                <span className="text-white/95">, no solo tu CV.</span>
              </h1>
            </FadeIn>

            <FadeIn delay={0.14}>
              <p className="mt-7 max-w-xl text-base leading-relaxed text-[#94A3B8] sm:text-lg sm:leading-8">
                HYRE conecta talento joven con empresas mediante simulaciones,
                entrevistas inteligentes y match multidimensional. Cinemático.
                Preciso. Listo para escalar.
              </p>
            </FadeIn>

            <FadeIn delay={0.22} className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button
                size="lg"
                className="group h-13 rounded-full bg-gradient-to-r from-[#7C3AED] to-[#9F67FF] px-8 text-base font-semibold shadow-[0_0_48px_rgba(124,58,237,0.55)] transition hover:brightness-110"
                asChild
              >
                <Link href="/interview">
                  Empezar entrevista IA
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-13 rounded-full border-white/15 bg-white/[0.04] px-8 text-base text-white backdrop-blur-md hover:bg-white/10"
                asChild
              >
                <a href="#producto">
                  <Play className="h-4 w-4 fill-current" />
                  Ver producto
                </a>
              </Button>
            </FadeIn>

            <FadeIn delay={0.3} className="mt-14 grid grid-cols-3 gap-6 border-t border-white/10 pt-10">
              {heroStats.map((stat) => (
                <div key={stat.label}>
                  <p className="font-display text-2xl font-semibold text-white sm:text-3xl">
                    {stat.value}
                  </p>
                  <p className="mt-1.5 text-xs leading-snug text-[#64748B] sm:text-sm">
                    {stat.label}
                  </p>
                </div>
              ))}
            </FadeIn>
          </div>

          <FadeIn delay={0.12} className="relative mx-auto w-full max-w-xl lg:max-w-none">
            <div
              className="relative aspect-[4/3] w-full perspective-[1200px]"
              onMouseMove={onMove}
              onMouseLeave={onLeave}
            >
              {floatingCards.map((card) => (
                <motion.div
                  key={card.label}
                  className="absolute z-20 hidden sm:block"
                  style={{ left: card.x, top: card.y }}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + card.delay, duration: 0.65 }}
                >
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{
                      duration: 4.5 + card.delay,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <GlassCard className="min-w-[148px] px-4 py-3.5" hover={false} borderGlow>
                      <p className="text-[10px] font-medium uppercase tracking-wider text-[#64748B]">
                        {card.label}
                      </p>
                      <p className="font-display text-xl font-semibold text-white">
                        {card.value}
                      </p>
                    </GlassCard>
                  </motion.div>
                </motion.div>
              ))}

              <motion.div
                style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
                initial={{ opacity: 0, scale: 0.9, y: 40 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="relative z-10 overflow-hidden rounded-[1.75rem] border border-white/12 bg-[#120a24]/90 p-1 shadow-[0_48px_120px_rgba(124,58,237,0.35)] backdrop-blur-2xl"
              >
                <div className="rounded-[1.5rem] border border-white/6 bg-gradient-to-b from-white/[0.07] to-transparent p-4 sm:p-6">
                  <div className="mb-5 flex items-center justify-between">
                    <div className="flex gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-[#EF4444]/90" />
                      <span className="h-2.5 w-2.5 rounded-full bg-[#F59E0B]/90" />
                      <span className="h-2.5 w-2.5 rounded-full bg-[#10B981]/90" />
                    </div>
                    <span className="font-mono text-[10px] text-[#64748B] sm:text-xs">
                      hyre.app/dashboard
                    </span>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                      <p className="text-xs text-[#64748B]">Match score</p>
                      <p className="mt-1 font-display text-3xl font-semibold text-white">94%</p>
                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-[#7C3AED] to-[#06B6D4]"
                          initial={{ width: 0 }}
                          animate={{ width: "94%" }}
                          transition={{ delay: 1.1, duration: 1.4, ease: "easeOut" }}
                        />
                      </div>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                      <p className="text-xs text-[#64748B]">XP Level</p>
                      <p className="mt-1 font-display text-3xl font-semibold text-[#06B6D4]">
                        2.4k
                      </p>
                      <p className="mt-2 text-xs font-medium text-[#10B981]">+120 esta semana</p>
                    </div>
                    <div className="col-span-full rounded-2xl border border-[#7C3AED]/25 bg-gradient-to-r from-[#7C3AED]/15 to-[#06B6D4]/10 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-medium text-[#C4B5FD]">Nova AI Insight</p>
                          <p className="mt-1.5 text-sm leading-snug text-white">
                            Tu perfil encaja 94% con roles Frontend remoto.
                          </p>
                        </div>
                        <Sparkles className="h-5 w-5 shrink-0 text-[#9F67FF]" />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  )
}
