"use client"

import Link from "next/link"
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion"
import { ArrowRight, ChevronDown, Play, Sparkles, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { GlassCard } from "@/components/landing/glass-card"
import { FadeIn } from "@/components/landing/motion"
import { heroStats } from "@/lib/landing/content"

const floatingCards = [
  {
    label: "Match IA",
    value: "94%",
    sub: "multidimensional",
    x: "-4%",
    y: "12%",
    delay: 0.3,
  },
  {
    label: "Entrevista IA",
    value: "Live",
    sub: "feedback real-time",
    x: "78%",
    y: "8%",
    delay: 0.45,
  },
  {
    label: "XP Progreso",
    value: "+420",
    sub: "esta semana",
    x: "72%",
    y: "68%",
    delay: 0.6,
  },
]

export function HeroSection() {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [10, -10]), {
    stiffness: 100,
    damping: 24,
  })
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-12, 12]), {
    stiffness: 100,
    damping: 24,
  })
  const spotlightX = useSpring(useTransform(mouseX, [-0.5, 0.5], [20, 80]), {
    stiffness: 60,
    damping: 20,
  })
  const spotlightY = useSpring(useTransform(mouseY, [-0.5, 0.5], [15, 65]), {
    stiffness: 60,
    damping: 20,
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
    <section className="relative min-h-[92vh] overflow-hidden pt-28 pb-20 sm:pt-36 sm:pb-28 lg:pb-32">
      <motion.div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background: useTransform(
            [spotlightX, spotlightY],
            ([x, y]) =>
              `radial-gradient(900px circle at ${x}% ${y}%, rgba(124,58,237,0.22), transparent 55%)`,
          ),
        }}
      />
      <div className="pointer-events-none absolute inset-x-0 top-24 h-[520px] bg-gradient-to-b from-[#7C3AED]/12 via-[#7C3AED]/4 to-transparent" />
      <div className="pointer-events-none absolute left-1/2 top-32 h-px w-[min(90%,720px)] -translate-x-1/2 bg-gradient-to-r from-transparent via-[#7C3AED]/50 to-transparent" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-10 xl:gap-16">
          <div className="relative z-10 max-w-2xl lg:max-w-none">
            <FadeIn>
              <div className="mb-8 inline-flex items-center gap-2.5 rounded-full border border-[#7C3AED]/40 bg-[#7C3AED]/10 px-4 py-2 text-xs font-medium tracking-wide text-[#C4B5FD] backdrop-blur-xl shadow-[0_0_32px_rgba(124,58,237,0.25)]">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#10B981] opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[#10B981]" />
                </span>
                <Sparkles className="h-3.5 w-3.5 text-[#9F67FF]" />
                AI Hiring Intelligence · Gen Z
              </div>
            </FadeIn>

            <FadeIn delay={0.05}>
              <h1 className="font-display text-[2.75rem] font-semibold leading-[0.98] tracking-[-0.03em] text-white sm:text-6xl lg:text-[4.5rem] xl:text-[5rem]">
                El hiring del{" "}
                <span className="relative inline-block">
                  <span className="bg-gradient-to-r from-[#7C3AED] via-[#C4B5FD] to-[#06B6D4] bg-clip-text text-transparent hyre-shimmer hyre-text-glow">
                    futuro
                  </span>
                </span>
                <br />
                <span className="text-white/90">empieza con evidencia.</span>
              </h1>
            </FadeIn>

            <FadeIn delay={0.12}>
              <p className="mt-7 max-w-xl text-lg leading-relaxed text-[#94A3B8] sm:text-xl sm:leading-9">
                HYRE une simulaciones inmersivas, entrevistas con IA y match
                multidimensional. Demuestra quién eres de verdad — con la
                precisión de una startup unicornio.
              </p>
            </FadeIn>

            <FadeIn delay={0.18} className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button
                size="lg"
                className="group relative h-14 overflow-hidden rounded-full bg-gradient-to-r from-[#7C3AED] via-[#9F67FF] to-[#7C3AED] bg-[length:200%_100%] px-9 text-base font-semibold shadow-[0_0_56px_rgba(124,58,237,0.55)] transition hover:bg-right hover:brightness-110"
                asChild
              >
                <Link href="/empezar">
                  <span className="relative z-10 flex items-center gap-2">
                    Empezar gratis
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                  </span>
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-14 rounded-full border-white/15 bg-white/[0.04] px-9 text-base text-white backdrop-blur-xl transition hover:border-[#7C3AED]/40 hover:bg-white/[0.08]"
                asChild
              >
                <a href="#producto" className="flex items-center gap-2">
                  <Play className="h-4 w-4 fill-current text-[#06B6D4]" />
                  Ver el producto
                </a>
              </Button>
            </FadeIn>

            <FadeIn delay={0.24} className="mt-8 flex flex-wrap items-center gap-4 text-sm text-[#64748B]">
              <span className="inline-flex items-center gap-1.5">
                <Zap className="h-4 w-4 text-[#FBBF24]" />
                Setup en 2 min
              </span>
              <span className="h-1 w-1 rounded-full bg-white/20" />
              <span>Sin tarjeta</span>
              <span className="h-1 w-1 rounded-full bg-white/20" />
              <span>Hecho para Gen Z</span>
            </FadeIn>

            <FadeIn delay={0.3} className="mt-14 grid grid-cols-3 gap-4 border-t border-white/10 pt-10 sm:gap-8">
              {heroStats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.08, duration: 0.6 }}
                >
                  <p className="font-display text-2xl font-semibold tracking-tight text-white sm:text-4xl">
                    {stat.value}
                  </p>
                  <p className="mt-2 text-[11px] leading-snug text-[#64748B] sm:text-xs">
                    {stat.label}
                  </p>
                </motion.div>
              ))}
            </FadeIn>
          </div>

          <FadeIn delay={0.1} className="relative mx-auto w-full max-w-xl lg:max-w-none">
            <div
              className="relative aspect-[4/3] w-full perspective-[1400px]"
              onMouseMove={onMove}
              onMouseLeave={onLeave}
            >
              {floatingCards.map((card) => (
                <motion.div
                  key={card.label}
                  className="absolute z-20 hidden sm:block"
                  style={{ left: card.x, top: card.y }}
                  initial={{ opacity: 0, y: 28, scale: 0.92 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 0.65 + card.delay, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                >
                  <motion.div
                    animate={{ y: [0, -12, 0] }}
                    transition={{
                      duration: 5 + card.delay,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <GlassCard
                      className="min-w-[160px] px-4 py-3.5 shadow-[0_20px_60px_rgba(0,0,0,0.45)]"
                      hover={false}
                      borderGlow
                    >
                      <p className="text-[10px] font-medium uppercase tracking-wider text-[#64748B]">
                        {card.label}
                      </p>
                      <p className="font-display text-2xl font-semibold text-white">
                        {card.value}
                      </p>
                      <p className="mt-0.5 text-[10px] text-[#06B6D4]">{card.sub}</p>
                    </GlassCard>
                  </motion.div>
                </motion.div>
              ))}

              <motion.div
                style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
                initial={{ opacity: 0, scale: 0.88, y: 48 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 1.1, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
                className="hyre-border-beam relative z-10 overflow-hidden rounded-[1.85rem] border border-white/12 bg-[#0d0818]/95 p-[3px] shadow-[0_56px_140px_rgba(124,58,237,0.4),0_0_0_1px_rgba(255,255,255,0.05)_inset]"
              >
                <div className="absolute -inset-1 bg-gradient-to-br from-[#7C3AED]/30 via-transparent to-[#06B6D4]/20 blur-2xl" />
                <div className="relative rounded-[1.65rem] border border-white/8 bg-gradient-to-b from-white/[0.08] to-[#0a0614]/90 p-4 sm:p-6">
                  <div className="mb-5 flex items-center justify-between gap-3">
                    <div className="flex gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-[#EF4444]/90" />
                      <span className="h-2.5 w-2.5 rounded-full bg-[#F59E0B]/90" />
                      <span className="h-2.5 w-2.5 rounded-full bg-[#10B981]/90" />
                    </div>
                    <span className="rounded-full border border-white/10 bg-black/30 px-2.5 py-0.5 font-mono text-[10px] text-[#64748B]">
                      hyre.app · command center
                    </span>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-white/10 bg-black/25 p-4 backdrop-blur-sm">
                      <p className="text-[10px] uppercase tracking-wider text-[#64748B]">
                        Match score
                      </p>
                      <p className="mt-1 font-display text-4xl font-semibold text-white">94%</p>
                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-[#7C3AED] via-[#9F67FF] to-[#06B6D4]"
                          initial={{ width: 0 }}
                          animate={{ width: "94%" }}
                          transition={{ delay: 1, duration: 1.6, ease: "easeOut" }}
                        />
                      </div>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-black/25 p-4 backdrop-blur-sm">
                      <p className="text-[10px] uppercase tracking-wider text-[#64748B]">
                        Nivel XP
                      </p>
                      <p className="mt-1 font-display text-4xl font-semibold text-[#06B6D4]">
                        2.4k
                      </p>
                      <p className="mt-2 text-xs font-medium text-[#10B981]">
                        +120 XP · racha 7 días
                      </p>
                    </div>
                    <div className="col-span-full rounded-2xl border border-[#7C3AED]/30 bg-gradient-to-r from-[#7C3AED]/20 via-[#7C3AED]/5 to-[#06B6D4]/10 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="flex items-center gap-1.5 text-xs font-medium text-[#C4B5FD]">
                            <Sparkles className="h-3.5 w-3.5" />
                            Nova AI · Insight
                          </p>
                          <p className="mt-2 text-sm leading-relaxed text-white/95">
                            Tu perfil encaja 94% con roles Frontend remoto. Prioriza
                            simulación React avanzada.
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="col-span-full grid grid-cols-3 gap-2">
                      {["Skills", "Voice", "Video"].map((label, i) => (
                        <div
                          key={label}
                          className="rounded-xl border border-white/8 bg-white/[0.03] px-2 py-2 text-center"
                        >
                          <p className="text-[9px] text-[#64748B]">{label}</p>
                          <p className="font-display text-sm font-semibold text-white">
                            {[92, 88, 91][i]}%
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </FadeIn>
        </div>

        <FadeIn delay={0.5} className="mt-16 flex justify-center">
          <a
            href="#producto"
            className="group flex flex-col items-center gap-2 text-[#64748B] transition hover:text-[#C4B5FD]"
            aria-label="Scroll to product"
          >
            <span className="text-[10px] font-medium uppercase tracking-[0.25em]">
              Explorar
            </span>
            <motion.span
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <ChevronDown className="h-5 w-5 opacity-70 group-hover:opacity-100" />
            </motion.span>
          </a>
        </FadeIn>
      </div>
    </section>
  )
}
