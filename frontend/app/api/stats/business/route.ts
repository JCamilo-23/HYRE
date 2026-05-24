import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import type { BusinessStats, RecentCandidate } from "@/modules/stats/types"
import type { Database } from "@/types/database"

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"]
type BusinessProfileRow = Database["public"]["Tables"]["business_profiles"]["Row"]

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data: profileRaw } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle()

  const profile = profileRaw as Pick<ProfileRow, "role"> | null
  if (profile?.role !== "business") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const [jobsResult, bpResult] = await Promise.all([
    supabase
      .from("jobs")
      .select("id, title, status")
      .eq("company_id", user.id),
    supabase
      .from("business_profiles")
      .select("company_name, industry, city, description")
      .eq("id", user.id)
      .maybeSingle(),
  ])

  const jobs = (jobsResult.data ?? []) as { id: string; title: string; status: string }[]
  const jobIds = jobs.map((j) => j.id)
  const jobsActive = jobs.filter((j) => j.status === "active").length
  const jobsTotal = jobs.length

  const bp = bpResult.data as Pick<BusinessProfileRow, "company_name" | "industry" | "city" | "description"> | null

  let candidatesMatched = 0
  let matchesMutual = 0
  let recentCandidates: RecentCandidate[] = []

  if (jobIds.length > 0) {
    const matchesResult = await supabase
      .from("job_matches")
      .select(
        "id, match_score, status, created_at, candidate_id, job_id, profiles(full_name, city, candidate_profiles(skills, career_stage)), jobs(title)"
      )
      .in("job_id", jobIds)
      .neq("status", "rejected")
      .order("created_at", { ascending: false })
      .limit(50)

    const matchRows = (matchesResult.data ?? []) as any[]
    candidatesMatched = matchRows.length
    matchesMutual = matchRows.filter((m) => m.status === "mutual").length

    recentCandidates = matchRows.slice(0, 5).map((m) => ({
      id: m.candidate_id,
      full_name: m.profiles?.full_name ?? null,
      match_score: m.match_score,
      skills: m.profiles?.candidate_profiles?.skills ?? [],
      city: m.profiles?.city ?? null,
      job_title: m.jobs?.title ?? "",
      match_status: m.status,
      matched_at: m.created_at,
    }))
  }

  let completeness = 0
  if (bp?.company_name) completeness += 25
  if (bp?.industry) completeness += 25
  if (bp?.city) completeness += 25
  if (bp?.description) completeness += 25

  const stats: BusinessStats = {
    jobs_active: jobsActive,
    jobs_total: jobsTotal,
    candidates_matched: candidatesMatched,
    matches_mutual: matchesMutual,
    profile_completeness: completeness,
    recent_candidates: recentCandidates,
  }

  return NextResponse.json(stats)
}
