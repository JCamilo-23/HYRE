"use client"

import { FadeIn } from "@/components/landing/motion"

const logos = [
  "TechCorp",
  "DesignLab",
  "StartupXYZ",
  "Nova AI",
  "TalentOS",
  "FutureHire",
  "ArcHire",
  "Vercel Labs",
]

function LogoRow() {
  return (
    <>
      {logos.map((name) => (
        <span
          key={name}
          className="mx-8 shrink-0 font-display text-sm font-semibold tracking-wide text-white/60 sm:text-base"
        >
          {name}
        </span>
      ))}
    </>
  )
}

export function TrustStrip() {
  return (
    <section className="relative overflow-hidden border-y border-white/5 py-12">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-[#0a0614] to-transparent sm:w-32" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-[#0a0614] to-transparent sm:w-32" />
      <FadeIn className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="mb-8 text-center text-xs font-medium uppercase tracking-[0.22em] text-[#64748B]">
          Confían en evidencia, no en suposiciones
        </p>
      </FadeIn>
      <div className="relative flex overflow-hidden">
        <div className="hyre-marquee flex items-center">
          <LogoRow />
          <LogoRow />
        </div>
      </div>
    </section>
  )
}
