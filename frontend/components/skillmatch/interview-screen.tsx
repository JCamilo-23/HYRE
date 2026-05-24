"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Video,
  Mic,
  Camera,
  Sun,
  Wifi,
  Headphones,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Screen } from "@/lib/hyre-types"
import { InterviewRoom } from "@/modules/ai-interview/components/InterviewRoom"
import { checkInterviewBackend, createInterviewSession } from "@/modules/ai-interview/api"

interface InterviewScreenProps {
  onNavigate: (screen: Screen) => void
}

const checklistItems = [
  { id: "camera", label: "Camara funcionando", icon: Camera, checked: true },
  { id: "mic", label: "Microfono activo", icon: Mic, checked: true },
  { id: "light", label: "Iluminacion adecuada", icon: Sun, checked: true },
  { id: "connection", label: "Conexion estable", icon: Wifi, checked: true },
  { id: "headphones", label: "Auriculares (opcional)", icon: Headphones, checked: false, optional: true },
]

export function InterviewScreen({ onNavigate }: InterviewScreenProps) {
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [acceptedTerms, setAcceptedTerms] = useState(false)

  const handleStart = async () => {
    setLoading(true)
    setError(null)
    try {
      const health = await checkInterviewBackend()
      if (!health.ok) {
        setError(health.detail ?? "El backend de entrevistas no está disponible. Asegúrate de que el servidor esté corriendo.")
        return
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
        job_context: "Candidato HYRE — Entrevista de práctica",
        required_skills: ["comunicación", "trabajo en equipo", "resolución de problemas"],
        agent_type: "auto",
        company_profile: { style: "balanced", intensity: "medium", name: "HYRE" },
      })
      setSessionId(session.session_id)
    } catch (err) {
      setError("No se pudo iniciar la entrevista. Verifica tu conexión e intenta de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  // Sala de entrevista real
  if (sessionId) {
    return (
      <div className="fixed inset-0 z-50 bg-[#0a0614]">
        <InterviewRoom sessionId={sessionId} role="candidate" />
        <button
          onClick={() => { setSessionId(null); onNavigate("home") }}
          className="absolute top-4 right-4 z-50 text-xs text-[#94A3B8] hover:text-white"
        >
          Salir
        </button>
      </div>
    )
  }

  // Lobby / preparación
  return (
    <div className="min-h-screen flex flex-col px-6 py-8 safe-area-top safe-area-bottom">
      <button
        onClick={() => onNavigate("home")}
        className="flex items-center gap-2 text-[#94A3B8] hover:text-[#F1F5F9] transition-colors mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        Volver
      </button>

      <h1 className="text-2xl font-semibold text-[#F1F5F9] mb-2">Entrevista con IA</h1>
      <p className="text-[#94A3B8] text-sm mb-8">Verifica que todo esté listo antes de comenzar</p>

      {/* Checklist */}
      <div className="glass rounded-2xl p-4 mb-6">
        <h3 className="text-[#F1F5F9] font-medium mb-4">Checklist pre-entrevista</h3>
        <div className="space-y-3">
          {checklistItems.map((item) => {
            const Icon = item.icon
            return (
              <div key={item.id} className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.checked ? "bg-[#10B981]/20" : "bg-[#1A1A2E]"}`}>
                  {item.checked ? (
                    <CheckCircle className="w-4 h-4 text-[#10B981]" />
                  ) : (
                    <Icon className="w-4 h-4 text-[#475569]" />
                  )}
                </div>
                <span className={`text-sm ${item.checked ? "text-[#F1F5F9]" : "text-[#475569]"}`}>
                  {item.label}
                </span>
                {item.optional && <span className="text-[#475569] text-xs">(opcional)</span>}
              </div>
            )
          })}
        </div>
      </div>

      {/* Info */}
      <div className="glass rounded-2xl p-4 mb-6">
        <h3 className="text-[#F1F5F9] font-medium mb-3">Información de la entrevista</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-[#94A3B8]">Duración estimada</span>
            <span className="text-[#F1F5F9]">15-25 minutos</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#94A3B8]">Análisis en tiempo real</span>
            <span className="text-[#F1F5F9]">Video + Audio + Respuestas</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#94A3B8]">Powered by</span>
            <span className="text-[#F1F5F9]">Gemini AI</span>
          </div>
        </div>
      </div>

      {/* Privacidad */}
      <div className="glass rounded-2xl p-4 mb-auto">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-[#F59E0B] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-[#F1F5F9] text-sm font-medium mb-1">Privacidad</p>
            <p className="text-[#94A3B8] text-xs leading-relaxed">
              La grabación solo es compartida con las empresas con tu permiso.
              No evaluamos apariencia física, acento o idioma nativo.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 text-sm text-[#F87171] text-center"
        >
          {error}
        </motion.p>
      )}

      <label className="flex items-start gap-3 my-4 cursor-pointer">
        <input
          type="checkbox"
          checked={acceptedTerms}
          onChange={(e) => setAcceptedTerms(e.target.checked)}
          className="mt-1 w-4 h-4 rounded border-[#475569] bg-[#1A1A2E] text-[#7C3AED] focus:ring-[#7C3AED]"
        />
        <span className="text-[#94A3B8] text-sm">
          Autorizo el análisis de video y audio de esta entrevista
        </span>
      </label>

      <Button
        onClick={handleStart}
        disabled={!acceptedTerms || loading}
        className={`w-full h-14 font-medium text-base flex items-center justify-center gap-2 ${
          acceptedTerms && !loading
            ? "btn-primary-gradient text-[#F1F5F9]"
            : "bg-[#1A1A2E] text-[#475569] cursor-not-allowed"
        }`}
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Iniciando sesión...
          </>
        ) : (
          <>
            <Video className="w-5 h-5" />
            Iniciar entrevista
          </>
        )}
      </Button>
    </div>
  )
}
