"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { SectionHeader } from "@/components/landing/section-header"
import { Stagger, StaggerItem } from "@/components/landing/motion"
import { features } from "@/lib/landing/content"

export function FeaturesSection() {
  return (
    <section id="producto" className="relative py-28 sm:py-36">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Producto"
          title="Todo lo que necesitas para contratar y ser contratado"
          description="Un ecosistema premium diseñado para Gen Z — potente para empresas, emocional para talento."
        />

        <Stagger className="mt-20 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <StaggerItem key={feature.title} className={cn(feature.span)}>
                <motion.article
                  whileHover={{ y: -8 }}
                  transition={{ type: "spring", stiffness: 320, damping: 22 }}
                  className={cn(
                    "hyre-glow-border group relative h-full overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl",
                    "transition-colors duration-500 hover:border-[#7C3AED]/35 hover:bg-white/[0.05]",
                    "hover:shadow-[0_24px_80px_rgba(124,58,237,0.18)]",
                    feature.span.includes("row-span-2") && "min-h-[340px] lg:min-h-[360px]",
                  )}
                >
                  <div
                    className={cn(
                      "pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-gradient-to-br opacity-25 blur-3xl transition duration-500 group-hover:opacity-50",
                      feature.accent,
                    )}
                  />
                  <div className="absolute inset-0 rounded-3xl opacity-0 ring-1 ring-inset ring-white/20 transition duration-500 group-hover:opacity-100" />
                  <div
                    className={cn(
                      "relative mb-6 inline-flex rounded-2xl border border-white/10 bg-white/5 p-3.5 shadow-inner",
                    )}
                  >
                    <Icon className="h-6 w-6 text-[#9F67FF] transition group-hover:scale-110" />
                  </div>
                  <h3 className="relative font-display text-xl font-semibold tracking-tight text-white sm:text-[1.35rem]">
                    {feature.title}
                  </h3>
                  <p className="relative mt-3 text-sm leading-relaxed text-[#94A3B8]">
                    {feature.description}
                  </p>
                </motion.article>
              </StaggerItem>
            )
          })}
        </Stagger>
      </div>
    </section>
  )
}
