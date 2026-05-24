"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Loader2, Sparkles, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { checkInterviewBackend, createInterviewSession } from "@/modules/ai-interview/api"

export default function InterviewLobbyPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [backendOk, setBackendOk] = useState<boolean | null>(null)
  const [geminiOk, setGeminiOk] = useState<boolean | null>(null)

  useEffect(() => {
    checkInterviewBackend().then((status) => {
      setBackendOk(status.ok)
      setGeminiOk(status.gemini_configured ?? false)
      if (!status.ok) setError(status.detail ?? null)
      else if (!status.gemini_configured) {
        setError(
          "GEMINI_API_KEY no está configurada en el backend (backend/.env). La entrevista requiere Gemini Pro.",
        )
      }
    })
  }, [])

  async function startInterview() {
    setLoading(true)
    setError(null)
    try {
      const health = await checkInterviewBackend()
      if (!health.ok) {
        throw new Error(health.detail ?? "Backend no disponible")
      }
      if (!health.gemini_configured) {
        throw new Error(
          "Configura GEMINI_API_KEY en backend/.env antes de iniciar la entrevista.",
        )
      }

      const candidateId =
        typeof window !== "undefined"
          ? localStorage.getItem("hyre_candidate_id") || crypto.randomUUID()
          : crypto.randomUUID()
      if (typeof window !== "undefined") {
        localStorage.setItem("hyre_candidate_id", candidateId)
      }
      const session = await createInterviewSession({
        candidate_id: candidateId,
        job_context: "Desarrollador Full Stack — HYRE",
        required_skills: ["react", "typescript", "comunicación", "trabajo en equipo"],
      })
      if (session.opening_question) {
        sessionStorage.setItem(
          `hyre_opening_${session.session_id}`,
          session.opening_question,
        )
      }
      router.push(`/interview/${session.session_id}`)
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "No se pudo conectar con el motor de entrevistas.",
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

        {backendOk === false && (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-[#F87171]/30 bg-[#F87171]/10 p-3 text-left text-sm text-[#FCA5A5]">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <p className="font-medium">Backend desconectado</p>
              <p className="mt-1 text-xs opacity-90">
                Terminal 1:{" "}
                <code className="rounded bg-black/30 px-1">
                  cd backend && uvicorn app.main:app --reload --port 8000
                </code>
              </p>
              <p className="mt-1 text-xs opacity-90">
                Terminal 2:{" "}
                <code className="rounded bg-black/30 px-1">cd frontend && npm run dev</code>
              </p>
            </div>
          </div>
        )}

        {backendOk && geminiOk === false && (
          <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-200">
            Añade <code className="rounded bg-black/30 px-1">GEMINI_API_KEY</code> en{" "}
            <code className="rounded bg-black/30 px-1">backend/.env</code>
          </div>
        )}

        {backendOk && geminiOk && (
          <p className="mt-4 text-xs text-[#10B981]">✓ Backend y Gemini listos</p>
        )}

        {error && <p className="mt-4 text-sm text-[#F87171]">{error}</p>}
        <Button
          size="lg"
          disabled={loading || backendOk === false || geminiOk === false}
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
