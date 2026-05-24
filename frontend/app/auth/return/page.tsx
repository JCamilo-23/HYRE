"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import {
  completeExternalAuth,
  readExternalAuthPending,
} from "@/modules/auth/external-social"

export default function AuthReturnPage() {
  const router = useRouter()
  const message = "Volviendo a HYRE..."

  useEffect(() => {
    const pending = readExternalAuthPending()

    if (!pending) {
      router.replace("/login?auth=error&reason=no_pending")
      return
    }

    completeExternalAuth(pending)
    const destination = pending.returnPath || "/app"
    router.replace(`${destination}?auth=success`)
  }, [router])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background px-6">
      <Loader2 className="h-8 w-8 animate-spin text-[#7C3AED]" aria-hidden />
      <p className="text-[#94A3B8] text-sm text-center">{message}</p>
    </div>
  )
}
