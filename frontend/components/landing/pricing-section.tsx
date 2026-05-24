"use client"

import Link from "next/link"
import { Check } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { SectionHeader } from "@/components/landing/section-header"
import { Stagger, StaggerItem } from "@/components/landing/motion"
import { pricingPlans } from "@/lib/landing/content"
import { cn } from "@/lib/utils"

export function PricingSection() {
  return (
    <section id="precios" className="relative py-28 sm:py-36">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-[#7C3AED]/8 to-transparent" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Precios"
          title="Planes que escalan contigo"
          description="Empieza gratis. Crece con Pro. Domina hiring con Enterprise."
        />

        <Stagger className="mt-20 grid gap-6 lg:grid-cols-3 lg:items-stretch">
          {pricingPlans.map((plan) => (
            <StaggerItem key={plan.name} className="flex">
              <motion.div
                whileHover={{ y: plan.highlighted ? -10 : -5 }}
                className={cn(
                  "relative flex w-full flex-col rounded-3xl border p-8 backdrop-blur-xl transition-shadow duration-500",
                  plan.highlighted
                    ? "z-10 border-[#7C3AED]/50 bg-gradient-to-b from-[#7C3AED]/25 via-[#120a24]/90 to-[#0a0614] shadow-[0_0_100px_rgba(124,58,237,0.35)] lg:scale-[1.03]"
                    : "border-white/10 bg-white/[0.03] hover:border-white/20",
                )}
              >
                {plan.highlighted && (
                  <>
                    <div className="pointer-events-none absolute -inset-px rounded-3xl bg-gradient-to-b from-[#7C3AED]/40 via-transparent to-[#06B6D4]/30 opacity-60" />
                    <span className="absolute -top-3.5 left-1/2 z-10 -translate-x-1/2 rounded-full bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] px-4 py-1 text-xs font-bold tracking-wide text-white shadow-lg">
                      Más popular
                    </span>
                  </>
                )}
                <div className="relative flex flex-1 flex-col">
                  <p className="text-sm font-medium text-[#94A3B8]">{plan.name}</p>
                  <div className="mt-5 flex items-baseline gap-1">
                    <span className="font-display text-4xl font-semibold text-white sm:text-5xl">
                      {plan.price}
                    </span>
                    {plan.period && (
                      <span className="text-sm text-[#64748B]">{plan.period}</span>
                    )}
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-[#94A3B8]">
                    {plan.description}
                  </p>
                  <ul className="mt-8 flex-1 space-y-3.5">
                    {plan.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-3 text-sm text-[#CBD5E1]"
                      >
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#10B981]" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className={cn(
                      "relative mt-10 h-12 w-full rounded-full text-base font-semibold",
                      plan.highlighted
                        ? "bg-gradient-to-r from-[#7C3AED] to-[#9F67FF] shadow-[0_0_36px_rgba(124,58,237,0.45)] hover:brightness-110"
                        : "border-white/15 bg-white/5 hover:bg-white/10",
                    )}
                    variant={plan.highlighted ? "default" : "outline"}
                    asChild
                  >
                    <Link href="/app">
                      {plan.cta}
                    </Link>
                  </Button>
                </div>
              </motion.div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  )
}
