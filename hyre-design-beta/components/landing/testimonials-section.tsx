"use client"

import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { ChevronLeft, ChevronRight, Quote } from "lucide-react"
import { SectionHeader } from "@/components/landing/section-header"
import { FadeIn } from "@/components/landing/motion"
import { testimonials } from "@/lib/landing/content"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

function TestimonialCard({
  quote,
  name,
  role,
  avatar,
  metric,
  className,
}: (typeof testimonials)[number] & { className?: string }) {
  return (
    <article
      className={cn(
        "relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-7 backdrop-blur-xl transition duration-500 hover:border-white/20 hover:bg-white/[0.06]",
        className,
      )}
    >
      <Quote className="mb-5 h-7 w-7 text-[#7C3AED]/50" />
      <p className="flex-1 text-base leading-relaxed text-[#E2E8F0] sm:text-lg">
        &ldquo;{quote}&rdquo;
      </p>
      <div className="mt-8 flex items-center justify-between gap-4 border-t border-white/10 pt-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-[#7C3AED] to-[#06B6D4] text-sm font-semibold text-white">
            {avatar}
          </div>
          <div>
            <p className="font-medium text-white">{name}</p>
            <p className="text-xs text-[#64748B]">{role}</p>
          </div>
        </div>
        <span className="shrink-0 rounded-full border border-[#10B981]/30 bg-[#10B981]/10 px-3 py-1 text-[11px] font-medium text-[#34D399]">
          {metric}
        </span>
      </div>
    </article>
  )
}

export function TestimonialsSection() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % testimonials.length)
    }, 7000)
    return () => clearInterval(timer)
  }, [])

  const current = testimonials[index]

  return (
    <section id="testimonios" className="relative py-28 sm:py-36">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Historias"
          title="Amado por talento y equipos de hiring"
          description="Resultados reales de candidatos y empresas que ya confían en evidencia, no en suposiciones."
        />

        <div className="mt-16 hidden gap-5 lg:grid lg:grid-cols-3">
          {testimonials.map((t, i) => (
            <FadeIn key={t.name} delay={i * 0.08}>
              <TestimonialCard {...t} />
            </FadeIn>
          ))}
        </div>

        <div className="relative mx-auto mt-12 max-w-3xl lg:hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.45 }}
            >
              <TestimonialCard {...current} />
            </motion.div>
          </AnimatePresence>

          <div className="mt-6 flex items-center justify-center gap-3">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full border-white/10 bg-white/5"
              onClick={() =>
                setIndex((i) => (i - 1 + testimonials.length) % testimonials.length)
              }
              aria-label="Anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIndex(i)}
                  className={cn(
                    "h-2 rounded-full transition-all",
                    i === index ? "w-8 bg-[#7C3AED]" : "w-2 bg-white/20",
                  )}
                  aria-label={`Testimonio ${i + 1}`}
                />
              ))}
            </div>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full border-white/10 bg-white/5"
              onClick={() => setIndex((i) => (i + 1) % testimonials.length)}
              aria-label="Siguiente"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
