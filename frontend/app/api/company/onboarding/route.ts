import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import type { CompanyProfile } from "@/lib/hyre-types"

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ detail: "No autorizado" }, { status: 401 })

  const profile: CompanyProfile = await request.json()

  // Guardar perfil de empresa
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: bpError } = await (supabase as any)
    .from("business_profiles")
    .upsert({
      id: user.id,
      company_name: profile.companyName,
      industry: profile.industry,
      company_size: profile.size,
      city: profile.location,
      description: profile.description,
      culture: profile.culture,
      benefits: profile.benefits,
    })

  if (bpError) return NextResponse.json({ detail: bpError.message }, { status: 500 })

  // Guardar primera vacante
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: jobError } = await (supabase as any)
    .from("jobs")
    .insert({
      company_id: user.id,
      title: profile.vacancyTitle,
      description: profile.description,
      requirements: profile.vacancyRequirements,
      location: profile.location,
      remote: profile.vacancyRemote,
      salary_min: profile.salaryMin ? parseInt(profile.salaryMin) : null,
      salary_max: profile.salaryMax ? parseInt(profile.salaryMax) : null,
      status: "active",
    })

  if (jobError) return NextResponse.json({ detail: jobError.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
