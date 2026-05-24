"use client"

import { Suspense } from "react"
import { HyreApp } from "@/components/skillmatch/hyre-app"
import { SplashScreen } from "@/components/skillmatch/splash-screen"

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <SplashScreen />
        </div>
      }
    >
      <HyreApp />
    </Suspense>
  )
}
