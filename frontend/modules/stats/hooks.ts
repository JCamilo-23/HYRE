"use client"

import { useEffect, useState } from "react"
import type { CandidateStats, BusinessStats } from "./types"

export function useCandidateStats() {
  const [data, setData] = useState<CandidateStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    fetch("/api/stats/candidate")
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text())
        return res.json() as Promise<CandidateStats>
      })
      .then((json) => { if (mounted) { setData(json); setIsLoading(false) } })
      .catch((err) => { if (mounted) { setError(err.message); setIsLoading(false) } })
    return () => { mounted = false }
  }, [])

  return { data, isLoading, error }
}

export function useBusinessStats() {
  const [data, setData] = useState<BusinessStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    fetch("/api/stats/business")
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text())
        return res.json() as Promise<BusinessStats>
      })
      .then((json) => { if (mounted) { setData(json); setIsLoading(false) } })
      .catch((err) => { if (mounted) { setError(err.message); setIsLoading(false) } })
    return () => { mounted = false }
  }, [])

  return { data, isLoading, error }
}
