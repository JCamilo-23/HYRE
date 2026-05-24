"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Bell, X } from "lucide-react"
import { usePushNotifications } from "@/hooks/usePushNotifications"

export function PushPermissionBanner() {
  const { status, loading, subscribe } = usePushNotifications()
  const [dismissed, setDismissed] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (status === "default" && !dismissed) {
      // Show banner after 3 seconds so it doesn't interrupt onboarding
      const t = setTimeout(() => setVisible(true), 3000)
      return () => clearTimeout(t)
    }
    setVisible(false)
  }, [status, dismissed])

  if (status === "unsupported" || status === "granted" || status === "denied") return null

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-20 left-4 right-4 z-50 max-w-sm mx-auto"
        >
          <div className="bg-[#1A1A2E] border border-[rgba(124,58,237,0.3)] rounded-2xl p-4 shadow-xl shadow-black/40">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-[#7C3AED]/20 flex items-center justify-center shrink-0">
                <Bell className="w-5 h-5 text-[#7C3AED]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[#F1F5F9] text-sm font-medium leading-snug">
                  Activa las notificaciones
                </p>
                <p className="text-[#94A3B8] text-xs mt-0.5">
                  Entérate cuando una empresa vea tu perfil o tengas un nuevo match.
                </p>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={subscribe}
                    disabled={loading}
                    className="flex-1 h-8 rounded-lg bg-[#7C3AED] text-white text-xs font-medium disabled:opacity-60"
                  >
                    {loading ? "Activando…" : "Activar"}
                  </button>
                  <button
                    onClick={() => { setDismissed(true); setVisible(false) }}
                    className="flex-1 h-8 rounded-lg border border-[rgba(255,255,255,0.1)] text-[#94A3B8] text-xs"
                  >
                    Ahora no
                  </button>
                </div>
              </div>
              <button
                onClick={() => { setDismissed(true); setVisible(false) }}
                className="text-[#475569] hover:text-[#94A3B8] shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
