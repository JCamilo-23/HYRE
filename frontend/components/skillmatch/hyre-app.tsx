"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { UserTypeScreen } from "@/components/skillmatch/user-type-screen"
import { RegisterScreen } from "@/components/skillmatch/register-screen"
import { CompanyOnboardingScreen } from "@/components/skillmatch/company-onboarding-screen"
import { HomeScreen } from "@/components/skillmatch/home-screen"
import { EmployerHomeScreen } from "@/components/skillmatch/employer-home-screen"
import { EmployerCandidatesScreen } from "@/components/skillmatch/employer-candidates-screen"
import { MatchScreen } from "@/components/skillmatch/match-screen"
import { SimulationScreen } from "@/components/skillmatch/simulation-screen"
import { InterviewScreen } from "@/components/skillmatch/interview-screen"
import { ReportScreen } from "@/components/skillmatch/report-screen"
import { ProfileScreen } from "@/components/skillmatch/profile-screen"
import { SettingsScreen } from "@/components/skillmatch/settings-screen"
import { MentorScreen } from "@/components/skillmatch/mentor-screen"
import { NovaScreen } from "@/components/skillmatch/nova-screen"
import { BottomNav } from "@/components/skillmatch/bottom-nav"
import { CandidateNova } from "@/components/nova/nova-root"

import type { CompanyProfile, Screen, UserData } from "@/lib/hyre-types"

export function HyreApp() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("userType")
  const [userType, setUserType] = useState<"candidate" | "company" | null>(null)
  const [isOnboarded, setIsOnboarded] = useState(false)
  const [pendingRegistration, setPendingRegistration] = useState<{ name: string; email: string } | null>(null)
  const [userData, setUserData] = useState<UserData>({
    name: "",
    email: "",
    userType: null,
  })

  const handleUserTypeSelect = (type: "candidate" | "company") => {
    setUserType(type)
    setCurrentScreen("register")
  }

  const handleRegisterComplete = (data: { name: string; email: string }) => {
    if (userType === "company") {
      setPendingRegistration(data)
      setCurrentScreen("companyOnboarding")
      return
    }

    setUserData({
      name: data.name,
      email: data.email,
      userType: userType,
    })
    setIsOnboarded(true)
    setCurrentScreen("home")
  }

  const handleCompanyOnboardingComplete = (company: CompanyProfile) => {
    const registration = pendingRegistration ?? { name: "", email: "" }
    setUserData({
      name: registration.name,
      email: registration.email,
      userType: "company",
      company,
    })
    setPendingRegistration(null)
    setIsOnboarded(true)
    setCurrentScreen("employerHome")
  }

  const handleResetToStart = () => {
    setCurrentScreen("userType")
    setUserType(null)
    setIsOnboarded(false)
    setPendingRegistration(null)
    setUserData({ name: "", email: "", userType: null })
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case "userType":
        return <UserTypeScreen onSelect={handleUserTypeSelect} />
      case "register":
        return (
          <RegisterScreen
            userType={userType}
            onComplete={handleRegisterComplete}
            onBack={() => setCurrentScreen("userType")}
          />
        )
      case "companyOnboarding":
        return (
          <CompanyOnboardingScreen
            contactName={pendingRegistration?.name ?? ""}
            onComplete={handleCompanyOnboardingComplete}
            onBack={() => setCurrentScreen("register")}
          />
        )
      case "home":
        return <HomeScreen onNavigate={setCurrentScreen} userData={userData} />
      case "employerHome":
        return <EmployerHomeScreen onNavigate={setCurrentScreen} userData={userData} />
      case "employerCandidates":
        return <EmployerCandidatesScreen />
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
      case "settings":
        return (
          <SettingsScreen
            onNavigate={setCurrentScreen}
            onResetToStart={handleResetToStart}
            userData={userData}
          />
        )
      case "mentor":
        return <MentorScreen onNavigate={setCurrentScreen} />
      case "nova":
        return <NovaScreen onNavigate={setCurrentScreen} />
      default:
        return <UserTypeScreen onSelect={handleUserTypeSelect} />
    }
  }

  const onboardingScreens: Screen[] = ["userType", "register", "companyOnboarding"]
  const hiddenNavScreens: Screen[] = ["interview", "simulation", "settings"]
  const showBottomNav =
    isOnboarded &&
    !onboardingScreens.includes(currentScreen) &&
    !hiddenNavScreens.includes(currentScreen)
  const showCandidateNova = isOnboarded && userData.userType === "candidate"

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {showCandidateNova && (
        <CandidateNova
          showBottomNav={showBottomNav}
          userName={userData.name}
          onNavigateToNova={() => setCurrentScreen("nova")}
        />
      )}

      {/* Background gradient effects */}
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
          <BottomNav
            currentScreen={currentScreen}
            onNavigate={setCurrentScreen}
            userType={userData.userType}
          />
        )}
      </main>
    </div>
  )
}
