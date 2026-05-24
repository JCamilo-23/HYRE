import type { NovaCV, NovaAnalysis } from "./types"

export async function uploadCV(
  file: File,
  opts?: { name?: string; targetRole?: string; industry?: string }
): Promise<{ cv_id: string; status: string }> {
  const form = new FormData()
  form.append("file", file)
  if (opts?.name) form.append("name", opts.name)
  if (opts?.targetRole) form.append("target_role", opts.targetRole)
  if (opts?.industry) form.append("industry", opts.industry)

  const res = await fetch("/api/nova/cv/upload", { method: "POST", body: form })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error ?? "Error al subir CV")
  }
  return res.json()
}

export async function analyzeCV(cvId: string): Promise<{ analysis_id: string; status: string }> {
  const res = await fetch(`/api/nova/cv/${cvId}/analyze`, { method: "POST" })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error ?? "Error al analizar CV")
  }
  return res.json()
}

export async function listCVs(): Promise<NovaCV[]> {
  const res = await fetch("/api/nova/cv", { cache: "no-store" })
  if (!res.ok) throw new Error("Error al cargar CVs")
  const body = await res.json()
  return body.cvs ?? []
}

export async function getAnalysis(cvId: string): Promise<NovaAnalysis> {
  const res = await fetch(`/api/nova/cv/${cvId}/analysis`, { cache: "no-store" })
  if (!res.ok) throw new Error("Análisis no disponible")
  const body = await res.json()
  return body.analysis
}
