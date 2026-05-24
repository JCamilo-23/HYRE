"use client"

import { FadeIn } from "@/components/landing/motion"
import { cn } from "@/lib/utils"

interface SectionHeaderProps {
  eyebrow: string
  title: string
  description?: string
  align?: "center" | "left"
  className?: string
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = "center",
  className,
}: SectionHeaderProps) {
  return (
    <FadeIn
      className={cn(
        "max-w-2xl",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      <p className="inline-flex items-center gap-2 text-sm font-medium uppercase tracking-[0.22em] text-[#7C3AED]">
        <span className="h-px w-8 bg-gradient-to-r from-[#7C3AED] to-transparent sm:w-12" />
        {eyebrow}
        {align === "center" && (
          <span className="h-px w-8 bg-gradient-to-l from-[#7C3AED] to-transparent sm:w-12" />
        )}
      </p>
      <h2 className="mt-5 font-display text-3xl font-semibold tracking-[-0.02em] text-white sm:text-4xl lg:text-[2.85rem] lg:leading-[1.08]">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-base leading-relaxed text-[#94A3B8] sm:text-lg">
          {description}
        </p>
      )}
    </FadeIn>
  )
}
