"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"
import { FadeIn } from "@/components/landing/motion"
import { timelineSteps } from "@/lib/landing/content"

export function HowItWorksSection() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  })
  const lineHeight = useTransform(scrollYProgress, [0.1, 0.85], ["0%", "100%"])

  return (
    <section id="como-funciona" className="relative py-24 sm:py-32" ref={ref}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#06B6D4]">
            Como funciona
          </p>
          <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            De perfil a contratacion en cuatro pasos
          </h2>
        </FadeIn>

        <div className="relative mx-auto mt-20 max-w-3xl">
          <div className="absolute left-[19px] top-0 hidden h-full w-px bg-white/10 sm:block md:left-1/2 md:-translate-x-px">
            <motion.div
              className="w-full origin-top bg-gradient-to-b from-[#7C3AED] via-[#06B6D4] to-[#10B981]"
              style={{ height: lineHeight }}
            />
          </div>

          <div className="space-y-12 sm:space-y-16">
            {timelineSteps.map((step, index) => {
              const Icon = step.icon
              const isEven = index % 2 === 0
              return (
                <FadeIn key={step.step} delay={index * 0.08}>
                  <div
                    className={`relative flex flex-col gap-6 sm:flex-row sm:items-center ${
                      isEven ? "md:flex-row" : "md:flex-row-reverse"
                    }`}
                  >
                    <div className="hidden md:absolute md:left-1/2 md:top-1/2 md:z-10 md:flex md:-translate-x-1/2 md:-translate-y-1/2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#7C3AED]/50 bg-[#0a0614] shadow-[0_0_30px_rgba(124,58,237,0.4)]">
                        <span className="text-xs font-semibold text-[#C4B5FD]">{step.step}</span>
                      </div>
                    </div>

                    <div className={`flex-1 ${isEven ? "md:pr-16 md:text-right" : "md:pl-16"}`}>
                      <span className="font-display text-sm text-[#7C3AED] md:hidden">
                        {step.step}
                      </span>
                      <h3 className="mt-1 font-display text-xl font-semibold text-white sm:text-2xl">
                        {step.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-[#94A3B8] sm:text-base">
                        {step.description}
                      </p>
                    </div>

                    <div
                      className={`flex flex-1 ${isEven ? "md:justify-start md:pl-16" : "md:justify-end md:pr-16"}`}
                    >
                      <motion.div
                        whileHover={{ scale: 1.03, rotate: 1 }}
                        className="inline-flex items-center gap-4 rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-transparent p-5 backdrop-blur-xl"
                      >
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#7C3AED]/20">
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
