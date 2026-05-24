"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Video,
  Mic,
  MicOff,
  VideoOff,
  Camera,
  Sun,
  Wifi,
  Headphones,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Play,
  Pause,
  Loader2,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Screen } from "@/lib/hyre-types"
import { useRealtimeInterview } from "@/modules/interview"

interface InterviewScreenProps {
  onNavigate: (screen: Screen) => void
}

type InterviewState = "prep" | "live" | "processing" | "complete"

const checklistItems = [
  { id: "camera", label: "Camara funcionando", icon: Camera, checked: true },
  { id: "mic", label: "Microfono activo", icon: Mic, checked: true },
  { id: "light", label: "Iluminacion adecuada", icon: Sun, checked: true },
  { id: "connection", label: "Conexion estable", icon: Wifi, checked: true },
  { id: "headphones", label: "Auriculares (opcional)", icon: Headphones, checked: false, optional: true },
]

export function InterviewScreen({ onNavigate }: InterviewScreenProps) {
  const [state, setState] = useState<InterviewState>("prep")
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [timer, setTimer] = useState(0)
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [processingStep, setProcessingStep] = useState(0)
  const [isStarting, setIsStarting] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  const interview = useRealtimeInterview({ candidateName: "Sofia" })

  const processingSteps = [
    "Analizando lenguaje corporal...",
    "Evaluando comunicacion...",
    "Procesando respuestas...",
    "Generando reporte personalizado...",
  ]

  useEffect(() => {
    const el = videoRef.current
    if (!el || !interview.mediaStream) return
    el.srcObject = interview.mediaStream
    void el.play().catch(() => {})
  }, [interview.mediaStream])

  useEffect(() => {
    if (interview.mediaStream) {
      interview.mediaStream.getAudioTracks().forEach((t) => {
        t.enabled = !isMuted
      })
      interview.mediaStream.getVideoTracks().forEach((t) => {
        t.enabled = !isVideoOff
      })
    }
  }, [isMuted, isVideoOff, interview.mediaStream])

  useEffect(() => {
    if (state === "live" && !isPaused) {
      const interval = setInterval(() => setTimer((prev) => prev + 1), 1000)
      return () => clearInterval(interval)
    }
  }, [state, isPaused])

  useEffect(() => {
    if (state === "processing") {
      const interval = setInterval(() => {
        setProcessingStep((prev) => {
          if (prev >= processingSteps.length - 1) {
            clearInterval(interval)
            setTimeout(() => setState("complete"), 1000)
            return prev
          }
          return prev + 1
        })
      }, 1500)
      return () => clearInterval(interval)
    }
  }, [state, processingSteps.length])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleStartInterview = async () => {
    setIsStarting(true)
    const id = await interview.startSession()
    if (id) {
      await interview.loadNextQuestion()
      setState("live")
      setTimer(0)
    }
    setIsStarting(false)
  }

  const handleNextQuestion = async () => {
    const transcript = interview.speech.getFullTranscript()
    const ok = await interview.submitAnswer()
    if (!ok) return

    const isLast = interview.progress.current >= interview.progress.total
    if (isLast) {
      if (interview.scores) {
        sessionStorage.setItem("hyre-interview-scores", JSON.stringify(interview.scores))
      }
      interview.endSession()
      setState("processing")
      return
    }

    await interview.loadNextQuestion(transcript)
  }

  const handleEndInterview = async () => {
    if (interview.currentQuestion && interview.speech.getFullTranscript()) {
      await interview.submitAnswer()
    }
    if (interview.scores) {
      sessionStorage.setItem("hyre-interview-scores", JSON.stringify(interview.scores))
    }
    interview.endSession()
    setState("processing")
  }

  const displayMetrics =
    interview.metrics.length > 0
      ? interview.metrics
      : [
          { id: "tone", label: "Tono de voz", value: "—", color: "#10B981" },
          { id: "speed", label: "Velocidad", value: "—", color: "#06B6D4" },
          { id: "contact", label: "Contacto visual", value: "—", color: "#7C3AED" },
          { id: "confidence", label: "Confianza", value: "—", color: "#10B981" },
        ]

  if (state === "prep") {
    return (
      <div className="min-h-screen flex flex-col px-6 py-8 safe-area-top safe-area-bottom">
        <button
          onClick={() => onNavigate("home")}
          className="flex items-center gap-2 text-[#94A3B8] hover:text-[#F1F5F9] transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Volver
        </button>

        <h1 className="text-2xl font-semibold text-[#F1F5F9] mb-2">Preparacion para entrevista</h1>
        <p className="text-[#94A3B8] text-sm mb-8">Verifica que todo este listo antes de comenzar</p>

        <div className="glass rounded-2xl p-4 mb-6">
          <h3 className="text-[#F1F5F9] font-medium mb-4">Checklist pre-entrevista</h3>
          <div className="space-y-3">
            {checklistItems.map((item) => {
              const Icon = item.icon
              return (
                <div key={item.id} className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      item.checked ? "bg-[#10B981]/20" : "bg-[#1A1A2E]"
                    }`}
                  >
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

        <div className="glass rounded-2xl p-4 mb-6">
          <h3 className="text-[#F1F5F9] font-medium mb-3">Informacion de la entrevista</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[#94A3B8]">Empresa</span>
              <span className="text-[#F1F5F9]">{interview.company.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#94A3B8]">Rol</span>
              <span className="text-[#F1F5F9]">{interview.company.vacancy}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#94A3B8]">Preguntas</span>
              <span className="text-[#F1F5F9]">{interview.progress.total} dinamicas (simulador)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#94A3B8]">Motor IA</span>
              <span className="text-[#F1F5F9] flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#06B6D4]" />
                Gemini Pro
              </span>
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-4 mb-auto">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-[#F59E0B] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[#F1F5F9] text-sm font-medium mb-1">Privacidad</p>
              <p className="text-[#94A3B8] text-xs leading-relaxed">
                La grabacion solo es compartida con {interview.company.name} con tu permiso. No
                evaluamos apariencia fisica, acento o idioma nativo.
              </p>
            </div>
          </div>
        </div>

        {interview.error && (
          <p className="text-[#EF4444] text-sm mb-3">{interview.error}</p>
        )}

        <label className="flex items-start gap-3 my-4 cursor-pointer">
          <input
            type="checkbox"
            checked={acceptedTerms}
            onChange={(e) => setAcceptedTerms(e.target.checked)}
            className="mt-1 w-4 h-4 rounded border-[#475569] bg-[#1A1A2E] text-[#7C3AED] focus:ring-[#7C3AED]"
          />
          <span className="text-[#94A3B8] text-sm">
            Autorizo el analisis de video y audio de esta entrevista
          </span>
        </label>

        <Button
          onClick={handleStartInterview}
          disabled={!acceptedTerms || isStarting}
          className={`w-full h-14 font-medium text-base flex items-center justify-center gap-2 ${
            acceptedTerms && !isStarting
              ? "btn-primary-gradient text-[#F1F5F9]"
              : "bg-[#1A1A2E] text-[#475569] cursor-not-allowed"
          }`}
        >
          {isStarting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Video className="w-5 h-5" />}
          {isStarting ? "Conectando..." : "Iniciar entrevista"}
        </Button>
      </div>
    )
  }

  if (state === "processing") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 py-8">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#7C3AED]/20 flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-[#7C3AED] animate-spin" />
          </div>

          <h1 className="text-xl font-semibold text-[#F1F5F9] mb-2">Entrevista completada!</h1>
          <p className="text-[#94A3B8] mb-8">Procesando reporte IA...</p>

          <div className="w-full max-w-xs mx-auto">
            <div className="h-2 bg-[#1A1A2E] rounded-full overflow-hidden mb-4">
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: `${((processingStep + 1) / processingSteps.length) * 100}%`,
                }}
                className="h-full bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] rounded-full"
              />
            </div>
            <AnimatePresence mode="wait">
              <motion.p
                key={processingStep}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-[#94A3B8] text-sm"
              >
                {processingSteps[processingStep]}
              </motion.p>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    )
  }

  if (state === "complete") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 py-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring" }}
          className="w-20 h-20 rounded-full bg-[#10B981]/20 flex items-center justify-center mb-6"
        >
          <CheckCircle className="w-10 h-10 text-[#10B981]" />
        </motion.div>

        <h1 className="text-2xl font-semibold text-[#F1F5F9] mb-2">Reporte listo!</h1>
        <p className="text-[#94A3B8] text-center mb-2">Tu reporte de entrevista esta disponible</p>
        {interview.scores && (
          <p className="text-[#7C3AED] font-semibold text-3xl mb-8">{interview.scores.overall}%</p>
        )}

        <Button
          onClick={() => onNavigate("report")}
          className="w-full max-w-xs h-14 btn-primary-gradient text-[#F1F5F9] font-medium"
        >
          Ver mi reporte
        </Button>
      </div>
    )
  }

  const questionText =
    interview.isLoadingQuestion
      ? "Generando pregunta con el simulador..."
      : interview.currentQuestion?.text ?? "Cargando..."

  const progressPct =
    interview.progress.total > 0
      ? Math.round((interview.progress.current / interview.progress.total) * 100)
      : 0

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A12]">
      <div className="flex items-center justify-between px-4 py-3 glass">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#EF4444] animate-pulse" />
          <span className="text-[#EF4444] text-xs font-medium">Grabando</span>
        </div>
        <span className="text-[#F1F5F9] font-mono text-sm">{formatTime(timer)}</span>
        <span className="text-[#94A3B8] text-xs">
          Pregunta {interview.progress.current || 1} de {interview.progress.total}
        </span>
      </div>

      <div className="h-1 bg-[#1A1A2E] mx-4 rounded-full overflow-hidden mb-2">
        <motion.div
          className="h-full bg-gradient-to-r from-[#7C3AED] to-[#06B6D4]"
          animate={{ width: `${progressPct}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      <div className="flex-1 flex flex-col">
        <div className="flex-1 flex items-center justify-center relative">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#06B6D4] flex items-center justify-center">
            <motion.div
              animate={{ scale: interview.isAnalyzing ? [1, 1.08, 1] : [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-24 h-24 rounded-full bg-[#0A0A12] flex items-center justify-center"
            >
              {interview.isAnalyzing || interview.isLoadingQuestion ? (
                <Loader2 className="w-8 h-8 text-[#7C3AED] animate-spin" />
              ) : (
                <span className="text-3xl font-bold bg-gradient-to-br from-[#7C3AED] to-[#06B6D4] bg-clip-text text-transparent">
                  AI
                </span>
              )}
            </motion.div>
          </div>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center">
            <p className="text-[#F1F5F9] font-medium">Alex</p>
            <p className="text-[#94A3B8] text-xs">Entrevistador IA · {interview.company.name}</p>
          </div>
        </div>

        <div className="px-6 py-4 glass mx-4 mb-3 rounded-xl">
          <AnimatePresence mode="wait">
            <motion.p
              key={interview.currentQuestion?.id ?? "loading"}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-[#F1F5F9] text-center text-sm leading-relaxed"
            >
              {questionText}
            </motion.p>
          </AnimatePresence>
          {interview.currentQuestion?.category && (
            <p className="text-[#475569] text-xs text-center mt-2 capitalize">
              {interview.currentQuestion.category.replace("_", " ")} ·{" "}
              {interview.currentQuestion.difficulty}
            </p>
          )}
        </div>

        <div className="px-6 py-3 glass mx-4 mb-3 rounded-xl min-h-[72px]">
          <p className="text-[#94A3B8] text-xs mb-1">Transcripcion en vivo</p>
          <p className="text-[#F1F5F9] text-sm leading-relaxed">
            {interview.speech.displayTranscript || (
              <span className="text-[#475569] italic">
                {interview.speech.supported
                  ? "Habla al microfono..."
                  : "Escribe tu respuesta en el campo de abajo"}
              </span>
            )}
          </p>
        </div>

        {interview.analysisFeedback && (
          <div className="px-6 py-2 glass mx-4 mb-3 rounded-xl border border-[#7C3AED]/30">
            <p className="text-[#94A3B8] text-xs mb-1">Analisis Gemini Pro</p>
            <p className="text-[#F1F5F9] text-sm">{interview.analysisFeedback}</p>
          </div>
        )}

        {interview.error && (
          <p className="text-[#EF4444] text-xs text-center px-6 mb-2">{interview.error}</p>
        )}

        <div className="px-4 mb-4">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {displayMetrics.map((metric) => (
              <div key={metric.id} className="flex-shrink-0 px-3 py-2 glass rounded-lg">
                <p className="text-[#94A3B8] text-xs">{metric.label}</p>
                <p className="font-medium text-sm" style={{ color: metric.color }}>
                  {metric.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute bottom-32 right-4 w-24 h-32 rounded-xl overflow-hidden glass">
          {interview.mediaStream && !isVideoOff ? (
            <video
              ref={videoRef}
              muted
              playsInline
              className="w-full h-full object-cover scale-x-[-1]"
            />
          ) : (
            <div className="w-full h-full bg-[#1A1A2E] flex items-center justify-center">
              <VideoOff className="w-8 h-8 text-[#475569]" />
            </div>
          )}
        </div>
      </div>

      <div className="px-6 pb-8 safe-area-bottom">
        {!interview.speech.supported && (
          <textarea
            className="w-full mb-3 h-20 rounded-xl bg-[#1A1A2E] border border-[#475569]/40 text-[#F1F5F9] text-sm p-3 resize-none"
            placeholder="Escribe tu respuesta aqui..."
            value={interview.speech.displayTranscript}
            onChange={(e) => interview.speech.setManualTranscript(e.target.value)}
          />
        )}

        <div className="flex items-center justify-center gap-4 mb-4">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsMuted(!isMuted)}
            className={`w-14 h-14 rounded-full flex items-center justify-center ${
              isMuted ? "bg-[#EF4444]" : "glass"
            }`}
          >
            {isMuted ? (
              <MicOff className="w-6 h-6 text-[#F1F5F9]" />
            ) : (
              <Mic className="w-6 h-6 text-[#F1F5F9]" />
            )}
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsPaused(!isPaused)}
            className="w-14 h-14 rounded-full bg-[#F59E0B] flex items-center justify-center"
          >
            {isPaused ? (
              <Play className="w-6 h-6 text-[#0A0A12]" />
            ) : (
              <Pause className="w-6 h-6 text-[#0A0A12]" />
            )}
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsVideoOff(!isVideoOff)}
            className={`w-14 h-14 rounded-full flex items-center justify-center ${
              isVideoOff ? "bg-[#EF4444]" : "glass"
            }`}
          >
            {isVideoOff ? (
              <VideoOff className="w-6 h-6 text-[#F1F5F9]" />
            ) : (
              <Video className="w-6 h-6 text-[#F1F5F9]" />
            )}
          </motion.button>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={handleNextQuestion}
            disabled={interview.isAnalyzing || interview.isLoadingQuestion}
            className="flex-1 h-12 btn-primary-gradient text-[#F1F5F9] font-medium"
          >
            {interview.isAnalyzing ? (
              <Loader2 className="w-5 h-5 animate-spin mx-auto" />
            ) : interview.progress.current >= interview.progress.total ? (
              "Finalizar"
            ) : (
              "Siguiente pregunta"
            )}
          </Button>
          <Button
            onClick={handleEndInterview}
            variant="outline"
            className="px-4 h-12 glass border-[#EF4444] text-[#EF4444] hover:bg-[#EF4444]/10"
          >
            Terminar
          </Button>
        </div>
      </div>
    </div>
  )
}
