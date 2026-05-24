"use client"

import { Suspense } from "react"
import { HyreApp } from "@/components/skillmatch/hyre-app"
import { SplashScreen } from "@/components/skillmatch/splash-screen"

function AppFallback() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <SplashScreen />
    </div>
  )
}

export default function ApplicationPage() {
  return (
    <Suspense fallback={<AppFallback />}>
      <HyreApp />
    </Suspense>
  )
}
