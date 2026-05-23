"use client"

import { useEffect, useState } from "react"
import { getJobs } from "./queries"
import type { Job } from "./types"

export function useJobs() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getJobs()
      .then(setJobs)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  return { jobs, loading, error }
}
