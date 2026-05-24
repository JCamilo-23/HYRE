"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Loader2, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createInterviewSession } from "@/modules/ai-interview/api"

export default function InterviewLobbyPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function startInterview() {
    setLoading(true)
    setError(null)
    try {
      const candidateId =
        typeof window !== "undefined"
          ? localStorage.getItem("hyre_candidate_id") ||
            crypto.randomUUID()
          : crypto.randomUUID()
      if (typeof window !== "undefined") {
        localStorage.setItem("hyre_candidate_id", candidateId)
      }
      const session = await createInterviewSession({
        candidate_id: candidateId,
        job_context: "Desarrollador Full Stack — HYRE",
        required_skills: ["react", "typescript", "comunicación", "trabajo en equipo"],
      })
      router.push(`/interview/${session.session_id}`)
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "No se pudo conectar con el motor de entrevistas. ¿Está el backend en http://localhost:8000?",
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0a0614] px-4 text-white">
      <div className="max-w-md text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#7C3AED]/30 bg-[#7C3AED]/10 px-4 py-2 text-sm text-[#C4B5FD]">
          <Sparkles className="h-4 w-4" />
          Motor IA — Gemini Pro
        </div>
        <h1 className="font-display text-3xl font-semibold">Entrevista en vivo</h1>
        <p className="mt-3 text-[#94A3B8]">
          Análisis en tiempo real de contenido, voz y lenguaje corporal con feedback
          instantáneo.
        </p>
        {error && <p className="mt-4 text-sm text-[#F87171]">{error}</p>}
        <Button
          size="lg"
          disabled={loading}
          className="mt-8 h-12 w-full rounded-full bg-gradient-to-r from-[#7C3AED] to-[#9F67FF]"
          onClick={startInterview}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Conectando…
            </>
          ) : (
            "Iniciar entrevista IA"
          )}
        </Button>
        <Link href="/" className="mt-4 block text-sm text-[#64748B] hover:text-white">
          ← Volver al inicio
        </Link>
      </div>
    </div>
  )
}
