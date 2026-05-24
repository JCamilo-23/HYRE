"use client"

import { useState, useEffect, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { SplashScreen } from "@/components/skillmatch/splash-screen"
import { UserTypeScreen } from "@/components/skillmatch/user-type-screen"
import { RegisterScreen } from "@/components/skillmatch/register-screen"
import { HomeScreen } from "@/components/skillmatch/home-screen"
import { MatchScreen } from "@/components/skillmatch/match-screen"
import { SimulationScreen } from "@/components/skillmatch/simulation-screen"
import { InterviewScreen } from "@/components/skillmatch/interview-screen"
import { ReportScreen } from "@/components/skillmatch/report-screen"
import { ProfileScreen } from "@/components/skillmatch/profile-screen"
import { MentorScreen } from "@/components/skillmatch/mentor-screen"
import { BottomNav } from "@/components/skillmatch/bottom-nav"
import { NovaAppSync } from "@/components/nova/nova-root"
import { createClient } from "@/lib/supabase/client"
import { mapRoleToUserType } from "@/modules/auth/utils"
import type { Profile } from "@/modules/auth/types"

import type { Screen, UserData } from "@/lib/hyre-types"

export function HyreApp() {
  const searchParams = useSearchParams()
  const [currentScreen, setCurrentScreen] = useState<Screen>("userType")
  const [userType, setUserType] = useState<"candidate" | "company" | null>(null)
  const [isOnboarded, setIsOnboarded] = useState(false)
  const [authChecking, setAuthChecking] = useState(true)
  const [authError, setAuthError] = useState<string | null>(null)
  const [userData, setUserData] = useState<UserData>({
    name: "",
    email: "",
    userType: null,
  })

  const hydrateFromSession = useCallback(async () => {
    const supabase = createClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.user) return false

    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single()

    const profile = profileData as Profile | null
    const mappedType = mapRoleToUserType(profile?.role)

    setUserData({
      name: profile?.full_name ?? session.user.email?.split("@")[0] ?? "Usuario",
      email: profile?.email ?? session.user.email ?? "",
      userType: mappedType,
    })
    setUserType(mappedType)
    setIsOnboarded(true)
    setCurrentScreen("home")
    return true
  }, [])

  useEffect(() => {
    const authStatus = searchParams.get("auth")
    const reason = searchParams.get("reason")

    if (authStatus === "error") {
      setAuthError(reason ?? "No se pudo completar el inicio de sesion")
      setCurrentScreen("register")
    }

    void (async () => {
      await hydrateFromSession()
      setAuthChecking(false)
    })()
  }, [searchParams, hydrateFromSession])

  useEffect(() => {
    const supabase = createClient()
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void hydrateFromSession()
    })
    return () => subscription.unsubscribe()
  }, [hydrateFromSession])

  const handleUserTypeSelect = (type: "candidate" | "company") => {
    setUserType(type)
    setAuthError(null)
    setCurrentScreen("register")
  }

  const handleRegisterComplete = (data: { name: string; email: string }) => {
    setUserData({ name: data.name, email: data.email, userType: userType })
    setIsOnboarded(true)
    setAuthError(null)
    setCurrentScreen("home")
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case "userType":
        return <UserTypeScreen onSelect={handleUserTypeSelect} />
      case "register":
        return (
          <>
            {authError && (
              <div className="mx-6 mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {decodeURIComponent(authError)}
              </div>
            )}
            <RegisterScreen userType={userType} onComplete={handleRegisterComplete} />
          </>
        )
      case "home":
        return <HomeScreen onNavigate={setCurrentScreen} userData={userData} />
      case "match":
        return <MatchScreen onNavigate={setCurrentScreen} />
      case "simulation":
        return <SimulationScreen onNavigate={setCurrentScreen} />
      case "interview":
        return <InterviewScreen onNavigate={setCurrentScreen} />
      case "report":
        return <ReportScreen onNavigate={setCurrentScreen} />
      case "profile":
        return <ProfileScreen onNavigate={setCurrentScreen} userData={userData} />
      case "mentor":
        return <MentorScreen onNavigate={setCurrentScreen} />
      default:
        return <UserTypeScreen onSelect={handleUserTypeSelect} />
    }
  }

  const showBottomNav =
    isOnboarded &&
    !["userType", "register", "interview", "simulation"].includes(currentScreen)

  if (authChecking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <SplashScreen />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <NovaAppSync
        isOnboarded={isOnboarded}
        showBottomNav={showBottomNav}
        userName={userData.name}
      />

      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#7C3AED]/15 rounded-full blur-[120px] opacity-50" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[#06B6D4]/15 rounded-full blur-[100px] opacity-40" />
        <div className="absolute top-1/2 left-0 w-[300px] h-[300px] bg-[#10B981]/10 rounded-full blur-[80px] opacity-30" />
      </div>

      <main className="relative z-10 max-w-md mx-auto min-h-screen">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentScreen}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="min-h-screen"
          >
            {renderScreen()}
          </motion.div>
        </AnimatePresence>

        {showBottomNav && (
          <BottomNav currentScreen={currentScreen} onNavigate={setCurrentScreen} />
        )}
      </main>
    </div>
  )
}
