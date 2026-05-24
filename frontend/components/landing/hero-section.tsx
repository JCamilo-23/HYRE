"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, Play, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { GlassCard } from "@/components/landing/glass-card"
import { FadeIn } from "@/components/landing/motion"
import { heroStats } from "@/lib/landing/content"

const floatingCards = [
  { label: "Match IA", value: "94%", x: "-8%", y: "18%", delay: 0.2 },
  { label: "XP ganado", value: "+420", x: "78%", y: "12%", delay: 0.35 },
  { label: "Simulacion", value: "Activa", x: "72%", y: "68%", delay: 0.5 },
]

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-28 pb-20 sm:pt-36 sm:pb-28 lg:pb-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-10">
          <div>
            <FadeIn>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#7C3AED]/30 bg-[#7C3AED]/10 px-4 py-1.5 text-xs font-medium text-[#C4B5FD] backdrop-blur-md">
                <Sparkles className="h-3.5 w-3.5" />
                La plataforma Gen Z de hiring con IA
              </div>
            </FadeIn>

            <FadeIn delay={0.08}>
              <h1 className="font-display text-4xl font-semibold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl xl:text-7xl">
                Demuestra tu{" "}
                <span className="bg-gradient-to-r from-[#7C3AED] via-[#9F67FF] to-[#06B6D4] bg-clip-text text-transparent">
                  potencial
                </span>
                , no solo tu CV.
              </h1>
            </FadeIn>

            <FadeIn delay={0.16}>
              <p className="mt-6 max-w-xl text-base leading-relaxed text-[#94A3B8] sm:text-lg">
                HYRE conecta talento joven con empresas mediante simulaciones,
                entrevistas inteligentes y match multidimensional. Cinematico.
                Preciso. Listo para escalar.
              </p>
            </FadeIn>

            <FadeIn delay={0.24} className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button
                size="lg"
                className="h-12 rounded-full bg-gradient-to-r from-[#7C3AED] to-[#9F67FF] px-8 text-base shadow-[0_0_40px_rgba(124,58,237,0.5)] hover:opacity-95"
                asChild
              >
                <Link href="/register">
                  Empezar ahora
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-12 rounded-full border-white/15 bg-white/5 px-8 text-base text-white backdrop-blur-md hover:bg-white/10"
                asChild
              >
                <a href="#producto">
                  <Play className="h-4 w-4 fill-current" />
                  Ver producto
                </a>
              </Button>
            </FadeIn>

            <FadeIn delay={0.32} className="mt-12 grid grid-cols-3 gap-4 border-t border-white/10 pt-8">
              {heroStats.map((stat) => (
                <div key={stat.label}>
                  <p className="font-display text-2xl font-semibold text-white sm:text-3xl">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-xs text-[#64748B] sm:text-sm">{stat.label}</p>
                </div>
              ))}
            </FadeIn>
          </div>

          <FadeIn delay={0.15} className="relative mx-auto w-full max-w-xl lg:max-w-none">
            <div className="relative aspect-[4/3] w-full">
              {floatingCards.map((card) => (
                <motion.div
                  key={card.label}
                  className="absolute z-20 hidden sm:block"
                  style={{ left: card.x, top: card.y }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + card.delay, duration: 0.6 }}
                >
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 4 + card.delay, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <GlassCard className="min-w-[140px] px-4 py-3" hover={false}>
                      <p className="text-[10px] uppercase tracking-wider text-[#64748B]">
                        {card.label}
                      </p>
                      <p className="font-display text-lg font-semibold text-white">{card.value}</p>
                    </GlassCard>
                  </motion.div>
                </motion.div>
              ))}

              <motion.div
                initial={{ opacity: 0, scale: 0.92, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.9, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className="relative z-10 overflow-hidden rounded-3xl border border-white/10 bg-[#120a24]/80 p-1 shadow-[0_40px_120px_rgba(124,58,237,0.25)] backdrop-blur-2xl"
              >
                <div className="rounded-[1.35rem] border border-white/5 bg-gradient-to-b from-white/[0.06] to-transparent p-4 sm:p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-[#EF4444]/80" />
                      <span className="h-2.5 w-2.5 rounded-full bg-[#F59E0B]/80" />
                      <span className="h-2.5 w-2.5 rounded-full bg-[#10B981]/80" />
                    </div>
                    <span className="text-xs text-[#64748B]">hyre.app/dashboard</span>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                      <p className="text-xs text-[#64748B]">Match score</p>
                      <p className="mt-1 font-display text-3xl font-semibold text-white">94%</p>
                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-[#7C3AED] to-[#06B6D4]"
                          initial={{ width: 0 }}
                          animate={{ width: "94%" }}
                          transition={{ delay: 1, duration: 1.2, ease: "easeOut" }}
                        />
                      </div>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                      <p className="text-xs text-[#64748B]">XP Level</p>
                      <p className="mt-1 font-display text-3xl font-semibold text-[#06B6D4]">
                        2.4k
                      </p>
                      <p className="mt-2 text-xs text-[#10B981]">+120 esta semana</p>
                    </div>
                    <div className="col-span-full rounded-2xl border border-[#7C3AED]/20 bg-[#7C3AED]/10 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-[#C4B5FD]">Nova AI Insight</p>
                          <p className="mt-1 text-sm text-white">
                            Tu perfil encaja 94% con roles Frontend remoto.
                          </p>
                        </div>
                        <Sparkles className="h-5 w-5 text-[#9F67FF]" />
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
