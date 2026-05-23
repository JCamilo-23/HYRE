"use client"

import { useState } from "react"
import { OnboardingScreen } from "@/components/hyre/onboarding-screen"
import { HomeScreen } from "@/components/hyre/home-screen"
import { MatchScreen } from "@/components/hyre/match-screen"
import { SimulationScreen } from "@/components/hyre/simulation-screen"
import { InterviewScreen } from "@/components/hyre/interview-screen"
import { ProfileScreen } from "@/components/hyre/profile-screen"
import { BottomNav } from "@/components/hyre/bottom-nav"

export type Screen = "onboarding" | "home" | "match" | "simulation" | "interview" | "profile"

export function HyreApp() {
  const [screen, setScreen] = useState<Screen>("onboarding")

  const showNav = screen !== "onboarding"

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto relative">
        {screen === "onboarding" && (
          <OnboardingScreen onComplete={() => setScreen("home")} />
        )}
        {screen === "home" && (
          <HomeScreen onNavigate={setScreen} />
        )}
        {screen === "match" && <MatchScreen />}
        {screen === "simulation" && (
          <SimulationScreen onNavigate={setScreen} />
        )}
        {screen === "interview" && <InterviewScreen />}
        {screen === "profile" && <ProfileScreen />}
        {showNav && (
          <BottomNav currentScreen={screen} onNavigate={setScreen} />
        )}
      </div>
    </div>
  )
}
