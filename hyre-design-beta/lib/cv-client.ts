import type { CvAnalysis } from "@/lib/hyre-types"
import { MOCK_CV_ANALYSIS } from "@/lib/mock-data"

export async function analyzeCvFile(file: File): Promise<{
  analysis: CvAnalysis
  extractedText?: string
  source?: "vision" | "document" | "text"
}> {
  await new Promise((r) => setTimeout(r, 1500))
  return {
    analysis: {
      ...MOCK_CV_ANALYSIS,
      summary: `${MOCK_CV_ANALYSIS.summary} (archivo: ${file.name})`,
    },
    extractedText: "Texto extraido del CV — modo demo de diseno.",
    source: "text",
  }
}
