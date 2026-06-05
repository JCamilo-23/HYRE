import type { NovaAnalysis, NovaCV } from "./types"
import { MOCK_NOVA_ANALYSIS } from "@/lib/mock-data"

let mockCvId = 0

export async function uploadCV(
  file: File,
  opts?: { name?: string; targetRole?: string; industry?: string },
): Promise<{ cv_id: string; status: string }> {
  await new Promise((r) => setTimeout(r, 600))
  mockCvId += 1
  return { cv_id: `mock-cv-${mockCvId}`, status: "ready" }
}

export async function analyzeCV(
  cvId: string,
): Promise<{ analysis_id: string; status: string }> {
  await new Promise((r) => setTimeout(r, 1200))
  return { analysis_id: `analysis-${cvId}`, status: "ready" }
}

export async function listCVs(): Promise<NovaCV[]> {
  return []
}

export async function getAnalysis(cvId: string): Promise<NovaAnalysis> {
  await new Promise((r) => setTimeout(r, 400))
  return { ...MOCK_NOVA_ANALYSIS, cv_id: cvId }
}
