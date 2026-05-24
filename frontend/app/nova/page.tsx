import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { NovaDashboard } from "./_client"

export const metadata = {
  title: "Nova CV Intelligence | HYRE",
  description: "Analiza y optimiza tu CV con IA",
}

export default async function NovaPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  return <NovaDashboard />
}
