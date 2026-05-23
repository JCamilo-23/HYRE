"use client"

import { useEffect } from "react"
import { NovaWidget } from "./nova-widget"
import { useNovaStore } from "@/store/nova-store"

interface NovaAppSyncProps {
  isOnboarded: boolean
  showBottomNav: boolean
  userName: string
}

/** Sincroniza estado de la app con el store global de Nova */
export function NovaAppSync({ isOnboarded, showBottomNav, userName }: NovaAppSyncProps) {
  const { setVisible, setHasBottomNav, setUserName } = useNovaStore()

  useEffect(() => {
    setVisible(isOnboarded)
  }, [isOnboarded, setVisible])

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
