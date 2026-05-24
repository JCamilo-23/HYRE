"use client"

import { useEffect } from "react"
import { NovaWidget } from "./nova-widget"
import { useNovaStore } from "@/store/nova-store"

interface EmployerNovaProps {
  showBottomNav: boolean
  userName: string
}

/** Nova solo para empresas — montaje local, no global */
export function EmployerNova({ showBottomNav, userName }: EmployerNovaProps) {
  const { setVisible, setHasBottomNav, setUserName, close } = useNovaStore()

  useEffect(() => {
    setVisible(true)
    return () => {
      setVisible(false)
      close()
    }
  }, [setVisible, close])

  useEffect(() => {
    setHasBottomNav(showBottomNav)
  }, [showBottomNav, setHasBottomNav])

  useEffect(() => {
    if (userName) setUserName(userName)
  }, [userName, setUserName])

  return <NovaWidget />
}
