import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  // First: try to get jobs with existing match scores
  const { data: matched } = await supabase
    .from("job_matches")
    .select("match_score, jobs(id, title, industry, location, remote, business_profiles(company_name))")
    .eq("candidate_id", user.id)
    .neq("status", "rejected")
    .order("match_score", { ascending: false })
    .limit(10)

  if (matched && matched.length > 0) {
    const jobs = matched.map((m: any) => ({
      id: m.jobs?.id,
      title: m.jobs?.title,
      company_name: m.jobs?.business_profiles?.company_name ?? null,
      industry: m.jobs?.industry ?? null,
      location: m.jobs?.location ?? null,
      remote: m.jobs?.remote ?? false,
      match_score: m.match_score,
    }))
    return NextResponse.json(jobs)
  }

  // Fallback: return random active jobs with null match_score
  const { data: fallback } = await supabase
    .from("jobs")
    .select("id, title, industry, location, remote, business_profiles(company_name)")
    .eq("status", "active")
    .limit(10)

  const jobs = (fallback ?? []).map((j: any) => ({
    id: j.id,
    title: j.title,
    company_name: j.business_profiles?.company_name ?? null,
    industry: j.industry ?? null,
    location: j.location ?? null,
    remote: j.remote ?? false,
    match_score: null,
  }))

  return NextResponse.json(jobs)
}
