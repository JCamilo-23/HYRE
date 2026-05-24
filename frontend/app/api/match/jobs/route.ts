import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import type { MatchCompany } from "@/lib/match-companies"

const COLORS = ["#7C3AED", "#06B6D4", "#10B981", "#F59E0B", "#8B5CF6", "#EF4444"]
const GRADIENTS = [
  "from-[#7C3AED]/30 to-[#06B6D4]/20",
  "from-[#06B6D4]/30 to-[#10B981]/20",
  "from-[#10B981]/30 to-[#F59E0B]/20",
  "from-[#F59E0B]/30 to-[#EF4444]/20",
  "from-[#8B5CF6]/30 to-[#06B6D4]/20",
]

function colorFor(id: string): string {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) & 0xffffffff
  return COLORS[Math.abs(h) % COLORS.length]
}

function gradientFor(id: string): string {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 17 + id.charCodeAt(i)) & 0xffffffff
  return GRADIENTS[Math.abs(h) % GRADIENTS.length]
}

function calcMatchScore(candidateSkills: string[], jobRequirements: string[]): number {
  if (!jobRequirements.length) return 60
  const candidateLower = candidateSkills.map((s) => s.toLowerCase())
  const matching = jobRequirements.filter((r) =>
    candidateLower.some((s) => s.includes(r.toLowerCase()) || r.toLowerCase().includes(s))
  ).length
  const overlap = matching / jobRequirements.length
  return Math.round(50 + overlap * 45 + Math.random() * 5)
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ detail: "No autorizado" }, { status: 401 })

  // Obtener perfil del candidato
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: candidateProfile } = await (supabase as any)
    .from("candidate_profiles")
    .select("skills, career_stage, city")
    .eq("id", user.id)
    .single()

  const candidateSkills: string[] = candidateProfile?.skills ?? []

  // Obtener vacantes activas con info de la empresa
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: jobs } = await (supabase as any)
    .from("jobs")
    .select(`
      id,
      title,
      description,
      requirements,
      location,
      remote,
      business_profiles!jobs_company_id_fkey(
        company_name,
        industry,
        company_size,
        city,
        culture,
        benefits
      )
    `)
    .eq("status", "active")
    .limit(20)

  if (!jobs?.length) return NextResponse.json([])

  // Excluir vacantes donde el candidato ya hizo match
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: existingMatches } = await (supabase as any)
    .from("job_matches")
    .select("job_id")
    .eq("candidate_id", user.id)

  const matchedJobIds = new Set((existingMatches ?? []).map((m: { job_id: string }) => m.job_id))

  const companies: (MatchCompany & { jobId: string })[] = jobs
    .filter((j: { id: string }) => !matchedJobIds.has(j.id))
    .map((job: {
      id: string
      title: string
      description: string
      requirements: string[]
      location: string | null
      remote: boolean
      business_profiles: {
        company_name: string
        industry: string | null
        company_size: string | null
        city: string | null
        culture: string[]
        benefits: string[]
      } | null
    }) => {
      const bp = job.business_profiles
      const score = calcMatchScore(candidateSkills, job.requirements ?? [])
      const name = bp?.company_name ?? "Empresa"
      return {
        id: job.id,
        jobId: job.id,
        name,
        industry: bp?.industry ?? "Empresa",
        size: bp?.company_size ?? "",
        match: score,
        vacancy: job.title,
        description: job.description,
        culture: bp?.culture ?? [],
        benefits: bp?.benefits ?? [],
        location: job.remote ? "Remoto" : (job.location ?? bp?.city ?? "Colombia"),
        logo: name.charAt(0).toUpperCase(),
        color: colorFor(job.id),
        bgGradient: gradientFor(job.id),
      }
    })
    .sort((a: { match: number }, b: { match: number }) => b.match - a.match)

  return NextResponse.json(companies)
}
