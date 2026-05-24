"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Profile } from "./types"

export function useAuth() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    let mounted = true

    const fetchProfile = async (userId: string) => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle()
      if (mounted) {
        setProfile(data ?? null)
        setLoading(false)
      }
    }

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!mounted) return
      if (!user) {
        setProfile(null)
        setLoading(false)
        return
      }
      fetchProfile(user.id)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return
      if (!session?.user) {
        setProfile(null)
        setLoading(false)
        return
      }
      fetchProfile(session.user.id)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  return { profile, loading, isAuthenticated: !!profile }
}
