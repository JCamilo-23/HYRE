"use client"

import { useEffect, useState } from "react"
import type { CandidateStats, BusinessStats } from "./types"
import { MOCK_BUSINESS_STATS, MOCK_CANDIDATE_STATS } from "@/lib/mock-data"

export function useCandidateStats() {
  const [data, setData] = useState<CandidateStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => {
      setData(MOCK_CANDIDATE_STATS)
      setIsLoading(false)
    }, 400)
    return () => clearTimeout(t)
  }, [])

  return { data, isLoading, error: null }
}

export function useBusinessStats() {
  const [data, setData] = useState<BusinessStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => {
      setData(MOCK_BUSINESS_STATS)
      setIsLoading(false)
    }, 400)
    return () => clearTimeout(t)
  }, [])

  return { data, isLoading, error: null }
}
