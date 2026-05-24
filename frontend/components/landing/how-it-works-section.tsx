"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"
import { SectionHeader } from "@/components/landing/section-header"
import { FadeIn } from "@/components/landing/motion"
import { timelineSteps } from "@/lib/landing/content"

export function HowItWorksSection() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.8", "end 0.35"],
  })
  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"])

  return (
    <section id="como-funciona" className="relative py-28 sm:py-36" ref={ref}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Cómo funciona"
          title="De perfil a contratación en cuatro pasos"
          description="Un flujo diseñado para demostrar talento real — claro, gamificado y potenciado por IA."
        />

        <div className="relative mx-auto mt-20 max-w-3xl">
          <div className="absolute left-[19px] top-2 hidden h-[calc(100%-1rem)] w-px bg-white/10 sm:block md:left-1/2 md:-translate-x-px">
            <motion.div
              className="w-full origin-top rounded-full bg-gradient-to-b from-[#7C3AED] via-[#06B6D4] to-[#10B981] shadow-[0_0_20px_rgba(124,58,237,0.5)]"
              style={{ height: lineHeight }}
            />
          </div>

          <div className="space-y-14 sm:space-y-20">
            {timelineSteps.map((step, index) => {
              const Icon = step.icon
              const isEven = index % 2 === 0
              return (
                <FadeIn key={step.step} delay={index * 0.06}>
                  <div
                    className={`relative flex flex-col gap-6 sm:flex-row sm:items-center ${
                      isEven ? "md:flex-row" : "md:flex-row-reverse"
                    }`}
                  >
                    <div className="hidden md:absolute md:left-1/2 md:top-1/2 md:z-10 md:flex md:-translate-x-1/2 md:-translate-y-1/2">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#7C3AED]/60 bg-[#0a0614] shadow-[0_0_32px_rgba(124,58,237,0.45)]">
                        <span className="font-display text-xs font-bold text-[#C4B5FD]">
                          {step.step}
                        </span>
                      </div>
                    </div>

                    <div className={`flex-1 ${isEven ? "md:pr-20 md:text-right" : "md:pl-20"}`}>
                      <span className="font-display text-sm font-semibold text-[#7C3AED] md:hidden">
                        Paso {step.step}
                      </span>
                      <h3 className="mt-1 font-display text-xl font-semibold text-white sm:text-2xl">
                        {step.title}
                      </h3>
                      <p className="mt-3 text-sm leading-relaxed text-[#94A3B8] sm:text-base">
                        {step.description}
                      </p>
                    </div>

                    <div
                      className={`flex flex-1 ${isEven ? "md:justify-start md:pl-20" : "md:justify-end md:pr-20"}`}
                    >
                      <motion.div
                        whileHover={{ scale: 1.04, rotate: 0.5 }}
                        className="inline-flex w-full max-w-xs items-center gap-4 rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-transparent p-5 backdrop-blur-xl sm:w-auto"
                      >
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#7C3AED]/20 ring-1 ring-[#7C3AED]/30">
                          <Icon className="h-6 w-6 text-[#9F67FF]" />
                        </div>
                        <span className="text-sm text-[#64748B]">Paso {step.step}</span>
                      </motion.div>
                    </div>
                  </div>
                </FadeIn>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
