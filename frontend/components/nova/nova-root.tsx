"use client"

import { useEffect } from "react"
import { NovaWidget } from "./nova-widget"
import { useNovaStore } from "@/store/nova-store"

interface NovaAppSyncProps {
  isOnboarded: boolean
  showBottomNav: boolean
  userName: string
  userType?: "candidate" | "company" | null
}

/** Sincroniza estado de la app con el store global de Nova */
export function NovaAppSync({ isOnboarded, showBottomNav, userName, userType }: NovaAppSyncProps) {
  const { setVisible, setHasBottomNav, setUserName, close } = useNovaStore()

  useEffect(() => {
    const isEmployer = userType === "company"
    const shouldShow = isOnboarded && isEmployer
    setVisible(shouldShow)
    if (!shouldShow) close()
  }, [isOnboarded, userType, setVisible, close])

  useEffect(() => {
    setHasBottomNav(showBottomNav)
  }, [showBottomNav, setHasBottomNav])

  useEffect(() => {
    if (userName) setUserName(userName)
  }, [userName, setUserName])

  return null
}

/** Montaje global persistente — layout root */
export function NovaRoot() {
  return <NovaWidget />
}
