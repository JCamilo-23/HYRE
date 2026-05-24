import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ detail: "No autorizado" }, { status: 401 })

  const { role, skills, city, modality }: {
    role: string
    skills: string[]
    city: string
    modality: string
  } = await request.json()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("candidate_profiles")
    .upsert({
      id: user.id,
      career_stage: role,
      skills,
      city,
    })

  if (error) return NextResponse.json({ detail: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
