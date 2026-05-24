import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import type { EmployerCandidate, SimulationResult } from "@/lib/employer-mock-data"

const COLORS = ["#7C3AED", "#06B6D4", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"]

function initials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
}

function colorFor(id: string): string {
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) & 0xffffffff
  return COLORS[Math.abs(hash) % COLORS.length]
}

function timeAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime()
  const h = Math.floor(diff / 3600000)
  if (h < 1) return "Hace menos de 1 hora"
  if (h < 24) return `Hace ${h} hora${h > 1 ? "s" : ""}`
  const d = Math.floor(h / 24)
  if (d === 1) return "Ayer"
  return `Hace ${d} días`
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ detail: "No autorizado" }, { status: 401 })

  // Buscar todas las vacantes de la empresa
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: jobs } = await (supabase as any)
    .from("jobs")
    .select("id, title")
    .eq("company_id", user.id)

  if (!jobs?.length) return NextResponse.json([])

  const jobIds = jobs.map((j: { id: string }) => j.id)
  const jobTitleMap: Record<string, string> = Object.fromEntries(
    jobs.map((j: { id: string; title: string }) => [j.id, j.title])
  )

  // Obtener job_matches con perfil de candidato
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: matches } = await (supabase as any)
    .from("job_matches")
    .select(`
      id,
      candidate_id,
      job_id,
      match_score,
      status,
      created_at,
      simulation_score,
      simulation_passed,
      simulation_quality,
      simulation_feedback,
      simulation_strengths,
      simulation_improvements,
      simulation_completed_at,
      profiles!job_matches_candidate_id_fkey(full_name),
      candidate_profiles!inner(skills, bio, career_stage)
    `)
    .in("job_id", jobIds)
    .order("created_at", { ascending: false })

  if (!matches?.length) return NextResponse.json([])

  const candidates: EmployerCandidate[] = matches.map((m: {
    id: string
    candidate_id: string
    job_id: string
    match_score: number
    status: string
    created_at: string
    simulation_score: number | null
    simulation_passed: boolean | null
    simulation_quality: string | null
    simulation_feedback: string | null
    simulation_strengths: string[] | null
    simulation_improvements: string[] | null
    simulation_completed_at: string | null
    profiles: { full_name: string | null } | null
    candidate_profiles: { skills: string[]; bio: string | null; career_stage: string | null } | null
  }) => {
    const name = m.profiles?.full_name ?? "Candidato"
    const skills = m.candidate_profiles?.skills ?? []
    const bio = m.candidate_profiles?.bio ?? ""
    const score = m.match_score

    const simulation: SimulationResult | undefined =
      m.simulation_score !== null && m.simulation_quality !== null
        ? {
            score: m.simulation_score,
            passed: m.simulation_passed ?? false,
            quality: m.simulation_quality as SimulationResult["quality"],
            feedback: m.simulation_feedback ?? "",
            strengths: (m.simulation_strengths as string[]) ?? [],
            improvements: (m.simulation_improvements as string[]) ?? [],
            completedAt: m.simulation_completed_at ? timeAgo(m.simulation_completed_at) : "",
          }
        : undefined

    const highlights = simulation?.strengths.slice(0, 3) ?? skills.slice(0, 2)

    return {
      id: m.id,
      matchId: m.id,
      candidateId: m.candidate_id,
      name,
      role: jobTitleMap[m.job_id] ?? "Vacante",
      match: score,
      score,
      skills,
      initials: initials(name),
      color: colorFor(m.candidate_id),
      status: (m.status as EmployerCandidate["status"]) ?? "pending",
      evaluatedAt: timeAgo(m.created_at),
      summary: bio || (simulation?.feedback ?? `${score}% de compatibilidad con la vacante.`),
      highlights,
      categories: [
        { label: "Comunicacion", score: Math.min(100, score + 4) },
        { label: "Tecnico", score: Math.max(0, score - 6) },
        { label: "Cultura", score: Math.min(100, score + 2) },
      ],
      simulation,
    } satisfies EmployerCandidate
  })

  return NextResponse.json(candidates)
}
