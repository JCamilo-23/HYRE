"use client"

import Link from "next/link"
import { Check } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { FadeIn, Stagger, StaggerItem } from "@/components/landing/motion"
import { pricingPlans } from "@/lib/landing/content"
import { cn } from "@/lib/utils"

export function PricingSection() {
  return (
    <section id="precios" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#7C3AED]">
            Precios
          </p>
          <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Planes que escalan contigo
          </h2>
          <p className="mt-4 text-[#94A3B8]">
            Empieza gratis. Crece con Pro. Domina hiring con Enterprise.
          </p>
        </FadeIn>

        <Stagger className="mt-16 grid gap-6 lg:grid-cols-3">
          {pricingPlans.map((plan) => (
            <StaggerItem key={plan.name}>
              <motion.div
                whileHover={{ y: plan.highlighted ? -8 : -4 }}
                className={cn(
                  "relative flex h-full flex-col rounded-3xl border p-8 backdrop-blur-xl transition",
                  plan.highlighted
                    ? "border-[#7C3AED]/50 bg-gradient-to-b from-[#7C3AED]/20 via-[#120a24]/80 to-[#0a0614] shadow-[0_0_80px_rgba(124,58,237,0.35)]"
                    : "border-white/10 bg-white/[0.03]",
                )}
              >
                {plan.highlighted && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] px-4 py-1 text-xs font-semibold text-white">
                    Mas popular
                  </span>
                )}
                <p className="text-sm font-medium text-[#94A3B8]">{plan.name}</p>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="font-display text-4xl font-semibold text-white">
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-sm text-[#64748B]">{plan.period}</span>
                  )}
                </div>
                <p className="mt-3 text-sm text-[#94A3B8]">{plan.description}</p>
                <ul className="mt-8 flex-1 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm text-[#CBD5E1]">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#10B981]" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  className={cn(
                    "mt-8 h-11 w-full rounded-full",
                    plan.highlighted
                      ? "bg-gradient-to-r from-[#7C3AED] to-[#9F67FF] shadow-[0_0_30px_rgba(124,58,237,0.4)]"
                      : "border-white/15 bg-white/5 hover:bg-white/10",
                  )}
                  variant={plan.highlighted ? "default" : "outline"}
                  asChild
                >
                  <Link href="/register">{plan.cta}</Link>
                </Button>
              </motion.div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  )
}
