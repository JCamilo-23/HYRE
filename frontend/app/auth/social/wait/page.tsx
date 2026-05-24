"use client"

import { Suspense } from "react"
import { SocialAuthWaitContent } from "./wait-content"

export default function SocialAuthWaitPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#0F172A] text-sm text-[#94A3B8]">
          Preparando acceso...
        </div>
      }
    >
      <SocialAuthWaitContent />
    </Suspense>
  )
}
