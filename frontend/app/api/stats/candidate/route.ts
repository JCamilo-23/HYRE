import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import type { CandidateStats, TopJob } from "@/modules/stats/types"
import type { Database } from "@/types/database"

type CandidateProfileRow = Database["public"]["Tables"]["candidate_profiles"]["Row"]
type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"]

const XP_THRESHOLDS = [0, 500, 1500, 3500, 7000, 12000, 20000]

function xpToLevel(xp: number): number {
  for (let i = XP_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= XP_THRESHOLDS[i]) return i + 1
  }
  return 1
}

function xpNextLevel(xp: number): number {
  const level = xpToLevel(xp)
  return XP_THRESHOLDS[level] ?? XP_THRESHOLDS[XP_THRESHOLDS.length - 1]
}

function xpProgressPct(xp: number): number {
  const level = xpToLevel(xp)
  const curr = XP_THRESHOLDS[level - 1] ?? 0
  const next = XP_THRESHOLDS[level] ?? XP_THRESHOLDS[XP_THRESHOLDS.length - 1]
  if (next === curr) return 100
  return Math.round(((xp - curr) / (next - curr)) * 100)
}

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
  if (profile?.role !== "candidate") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const [cpResult, matchesResult, simResult, topJobsResult] = await Promise.all([
    supabase
      .from("candidate_profiles")
      .select("xp, level, nova_cv_score, simulations_completed, profile_completeness, city, career_stage, skills, bio")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("job_matches")
      .select("status")
      .eq("candidate_id", user.id),
    supabase
      .from("work_simulator_sessions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("status", "active"),
    supabase
      .from("job_matches")
      .select("match_score, status, jobs(id, title, industry, location, remote, business_profiles(company_name))")
      .eq("candidate_id", user.id)
      .neq("status", "rejected")
      .order("match_score", { ascending: false })
      .limit(3),
  ])

  const cp = cpResult.data as Pick<
    CandidateProfileRow,
    "xp" | "level" | "nova_cv_score" | "simulations_completed" | "profile_completeness" | "city" | "career_stage" | "skills" | "bio"
  > | null

  const matches = (matchesResult.data ?? []) as { status: string }[]

  const xp = cp?.xp ?? 0
  const level = xpToLevel(xp)
  const novaCvScore = cp?.nova_cv_score ?? null
  const simulationsCompleted = cp?.simulations_completed ?? 0
  const simulationsActive = simResult.count ?? 0

  let completeness = 0
  if (cp?.city) completeness += 20
  if (cp?.career_stage) completeness += 20
  if (Array.isArray(cp?.skills) && cp.skills.length > 2) completeness += 20
  if (novaCvScore !== null) completeness += 20
  if (cp?.bio) completeness += 20

  const matchesNew = matches.filter((m) => m.status === "pending").length
  const matchesMutual = matches.filter((m) => m.status === "mutual").length

  const topJobs: TopJob[] = ((topJobsResult.data ?? []) as any[]).map((m) => ({
    id: m.jobs?.id ?? "",
    title: m.jobs?.title ?? "",
    company_name: m.jobs?.business_profiles?.company_name ?? "",
    industry: m.jobs?.industry ?? null,
    match_score: m.match_score,
    location: m.jobs?.location ?? null,
    remote: m.jobs?.remote ?? false,
  }))

  const stats: CandidateStats = {
    xp,
    level,
    xp_next_level: xpNextLevel(xp),
    xp_progress_pct: xpProgressPct(xp),
    nova_cv_score: novaCvScore,
    matches_new: matchesNew,
    matches_mutual: matchesMutual,
    simulations_active: simulationsActive,
    simulations_completed: simulationsCompleted,
    profile_completeness: completeness,
    top_jobs: topJobs,
  }

  return NextResponse.json(stats)
}
