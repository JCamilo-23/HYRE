"use client"

import { motion } from "framer-motion"
import { BarChart3, Brain, Target, Trophy } from "lucide-react"
import { FadeIn } from "@/components/landing/motion"

const matches = [
  { company: "TechCorp", role: "Frontend Dev", match: 94, color: "#7C3AED" },
  { company: "DesignLab", role: "UX Designer", match: 89, color: "#06B6D4" },
  { company: "StartupXYZ", role: "Growth", match: 87, color: "#10B981" },
]

export function ProductPreviewSection() {
  return (
    <section className="relative overflow-hidden py-24 sm:py-32">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#7C3AED]/5 to-transparent" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#10B981]">
            Vista previa
          </p>
          <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Un dashboard que se siente del futuro
          </h2>
          <p className="mt-4 text-[#94A3B8]">
            Analytics en tiempo real, match scores y progreso XP — todo en una interfaz
            cinematic y clara.
          </p>
        </FadeIn>

        <FadeIn delay={0.1} className="mt-16">
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#120a24]/60 shadow-[0_0_80px_rgba(6,182,212,0.12)] backdrop-blur-2xl">
            <div className="grid lg:grid-cols-12">
              <aside className="hidden border-r border-white/10 bg-black/20 p-6 lg:col-span-3 lg:block">
                <p className="text-xs uppercase tracking-wider text-[#64748B]">HYRE</p>
                <nav className="mt-8 space-y-2 text-sm">
                  {["Overview", "Matches", "Simulaciones", "Entrevistas", "Analytics"].map(
                    (item, i) => (
                      <div
                        key={item}
                        className={`rounded-lg px-3 py-2 ${
                          i === 0
                            ? "bg-[#7C3AED]/20 text-white"
                            : "text-[#64748B] hover:text-white"
                        }`}
                      >
                        {item}
                      </div>
                    ),
                  )}
                </nav>
              </aside>

              <div className="p-6 sm:p-8 lg:col-span-9">
                <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h3 className="font-display text-xl font-semibold text-white">
                      Talent Command Center
                    </h3>
                    <p className="text-sm text-[#64748B]">Actualizado hace 2 min</p>
                  </div>
                  <div className="flex gap-2">
                    <span className="rounded-full border border-[#10B981]/30 bg-[#10B981]/10 px-3 py-1 text-xs text-[#34D399]">
                      IA activa
                    </span>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {[
                    { icon: Target, label: "Matches hoy", value: "12", trend: "+3" },
                    { icon: Brain, label: "Score promedio", value: "91", trend: "+5%" },
                    { icon: Trophy, label: "XP total", value: "2.4k", trend: "+120" },
                    { icon: BarChart3, label: "Entrevistas", value: "4", trend: "2 listas" },
                  ].map((kpi, i) => (
                    <motion.div
                      key={kpi.label}
                      initial={{ opacity: 0, y: 16 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.08 }}
                      className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                    >
                      <kpi.icon className="mb-2 h-4 w-4 text-[#7C3AED]" />
                      <p className="text-xs text-[#64748B]">{kpi.label}</p>
                      <p className="font-display text-2xl font-semibold text-white">{kpi.value}</p>
                      <p className="mt-1 text-xs text-[#10B981]">{kpi.trend}</p>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-6 grid gap-4 lg:grid-cols-5">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 lg:col-span-3">
                    <p className="mb-4 text-sm font-medium text-white">Top matches</p>
                    <div className="space-y-3">
                      {matches.map((m, i) => (
                        <motion.div
                          key={m.company}
                          initial={{ opacity: 0, x: -12 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.2 + i * 0.1 }}
                          className="flex items-center gap-4 rounded-xl border border-white/5 bg-white/[0.02] p-3"
                        >
                          <div
                            className="flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold text-white"
                            style={{ backgroundColor: `${m.color}33`, color: m.color }}
                          >
                            {m.company[0]}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-white">{m.company}</p>
                            <p className="text-xs text-[#64748B]">{m.role}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-display text-lg font-semibold" style={{ color: m.color }}>
                              {m.match}%
                            </p>
                            <p className="text-[10px] text-[#64748B]">match</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-[#7C3AED]/20 bg-gradient-to-b from-[#7C3AED]/15 to-transparent p-4 lg:col-span-2">
                    <p className="text-sm font-medium text-white">Progreso XP</p>
                    <div className="mt-4 flex items-end justify-between">
                      <span className="font-display text-4xl font-semibold text-[#06B6D4]">
                        Lv.12
                      </span>
                      <span className="text-xs text-[#94A3B8]">72% al siguiente</span>
                    </div>
                    <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/10">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-[#7C3AED] to-[#06B6D4]"
                        initial={{ width: 0 }}
                        whileInView={{ width: "72%" }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                      />
                    </div>
                    <p className="mt-4 text-xs leading-relaxed text-[#94A3B8]">
                      Completa 1 simulacion mas para desbloquear badge Elite Matcher.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
