"use client"

import { FadeIn } from "@/components/landing/motion"

const logos = [
  "TechCorp",
  "DesignLab",
  "StartupXYZ",
  "Nova AI",
  "TalentOS",
  "FutureHire",
]

export function TrustStrip() {
  return (
    <section className="relative border-y border-white/5 py-10">
      <FadeIn className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="mb-6 text-center text-xs font-medium uppercase tracking-[0.2em] text-[#64748B]">
          Confían en evidencia, no en suposiciones
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 opacity-60">
          {logos.map((name) => (
            <span
              key={name}
              className="font-display text-sm font-semibold tracking-wide text-white/70 sm:text-base"
            >
              {name}
            </span>
          ))}
        </div>
      </FadeIn>
    </section>
  )
}
