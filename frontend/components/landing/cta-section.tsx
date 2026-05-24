"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FadeIn } from "@/components/landing/motion"

export function CtaSection() {
  return (
    <section className="relative py-28 sm:py-36">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="relative overflow-hidden rounded-[2rem] border border-white/12 px-6 py-16 text-center sm:px-14 sm:py-24">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(124,58,237,0.35),transparent_55%)]" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#7C3AED]/20 via-transparent to-[#06B6D4]/15" />
            <motion.div
              className="pointer-events-none absolute -left-24 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-[#7C3AED]/40 blur-[120px]"
              animate={{ scale: [1, 1.2, 1], opacity: [0.35, 0.55, 0.35] }}
              transition={{ duration: 7, repeat: Infinity }}
            />
            <motion.div
              className="pointer-events-none absolute -right-24 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-[#06B6D4]/30 blur-[120px]"
              animate={{ scale: [1.15, 1, 1.15], opacity: [0.25, 0.45, 0.25] }}
              transition={{ duration: 8, repeat: Infinity }}
            />

            <div className="relative z-10">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#C4B5FD]">
                Únete a HYRE
              </p>
              <h2 className="mx-auto mt-4 max-w-3xl font-display text-3xl font-semibold leading-tight tracking-[-0.02em] text-white sm:text-4xl lg:text-[3.25rem] hyre-text-glow">
                El futuro del trabajo empieza con evidencia, no con suposiciones.
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-base text-[#94A3B8] sm:text-lg">
                Miles de jóvenes y empresas ya están redefiniendo cómo se descubre y
                contrata talento. Tu turno.
              </p>
              <div className="mt-11 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button
                  size="lg"
                  className="h-13 rounded-full bg-white px-9 text-base font-semibold text-[#0a0614] shadow-xl hover:bg-white/95"
                  asChild
                >
                  <Link href="/empezar">
                    Crear cuenta gratis
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-13 rounded-full border-white/25 bg-white/5 px-9 text-base text-white backdrop-blur-sm hover:bg-white/10"
                  asChild
                >
                  <Link href="/login">Iniciar Sesión</Link>
                </Button>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
