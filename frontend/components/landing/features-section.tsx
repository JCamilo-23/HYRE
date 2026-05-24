"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { FadeIn, Stagger, StaggerItem } from "@/components/landing/motion"
import { features } from "@/lib/landing/content"

export function FeaturesSection() {
  return (
    <section id="producto" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#7C3AED]">
            Producto
          </p>
          <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Todo lo que necesitas para contratar y ser contratado
          </h2>
          <p className="mt-4 text-[#94A3B8]">
            Un ecosistema premium disenado para Gen Z — potente para empresas,
            emocional para talento.
          </p>
        </FadeIn>

        <Stagger className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <StaggerItem key={feature.title} className={cn(feature.span)}>
                <motion.article
                  whileHover={{ y: -6 }}
                  transition={{ type: "spring", stiffness: 300, damping: 24 }}
                  className={cn(
                    "group relative h-full overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl",
                    "before:pointer-events-none before:absolute before:inset-0 before:rounded-3xl before:opacity-0 before:transition before:duration-500",
                    "hover:border-white/20 hover:before:opacity-100",
                    feature.span.includes("row-span-2") && "min-h-[320px]",
                  )}
                >
                  <div
                    className={cn(
                      "pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br opacity-20 blur-2xl transition group-hover:opacity-40",
                      feature.accent,
                    )}
                  />
                  <div
                    className={cn(
                      "mb-5 inline-flex rounded-2xl border border-white/10 bg-white/5 p-3",
                      `bg-gradient-to-br ${feature.accent} bg-clip-text`,
                    )}
                  >
                    <Icon className="h-6 w-6 text-[#9F67FF]" />
                  </div>
                  <h3 className="font-display text-xl font-semibold text-white">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#94A3B8]">
                    {feature.description}
                  </p>
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 transition group-hover:opacity-100" />
                </motion.article>
              </StaggerItem>
            )
          })}
        </Stagger>
      </div>
    </section>
  )
}
