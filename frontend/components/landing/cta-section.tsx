"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FadeIn } from "@/components/landing/motion"

export function CtaSection() {
  return (
    <section className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 px-6 py-16 text-center sm:px-12 sm:py-20">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#7C3AED]/30 via-transparent to-[#06B6D4]/20" />
            <motion.div
              className="pointer-events-none absolute -left-20 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-[#7C3AED]/40 blur-[100px]"
              animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.6, 0.4] }}
              transition={{ duration: 6, repeat: Infinity }}
            />
            <motion.div
              className="pointer-events-none absolute -right-20 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-[#06B6D4]/30 blur-[100px]"
              animate={{ scale: [1.1, 1, 1.1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 7, repeat: Infinity }}
            />

            <div className="relative z-10">
              <h2 className="font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
                El futuro del trabajo empieza con evidencia, no con suposiciones.
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-[#94A3B8] sm:text-lg">
                Unete a miles de jovenes y empresas que ya estan redefiniendo como se
                descubre y contrata talento.
              </p>
              <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button
                  size="lg"
                  className="h-12 rounded-full bg-white px-8 text-base text-[#0a0614] hover:bg-white/90"
                  asChild
                >
                  <Link href="/register">
                    Crear cuenta gratis
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 rounded-full border-white/20 bg-transparent px-8 text-base text-white hover:bg-white/10"
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
