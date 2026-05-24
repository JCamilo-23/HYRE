"use client"

import { useEffect } from "react"
import { NovaWidget } from "./nova-widget"
import { useNovaStore } from "@/store/nova-store"

interface CandidateNovaProps {
  showBottomNav: boolean
  userName: string
}

/** Nova solo para candidatos (usuarios naturales) */
export function CandidateNova({ showBottomNav, userName }: CandidateNovaProps) {
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
