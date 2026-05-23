"use client"

import { useState, useEffect, useRef, useCallback } from "react"
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
  Circle,
  Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Screen } from "@/app/page"

interface InterviewScreenProps {
  onNavigate: (screen: Screen) => void
  jobId?: string | null
  onSimulationCreated?: (id: string) => void
}

type InterviewState = "prep" | "live" | "processing" | "complete"

const checklistItems = [
  { id: "camera", label: "Camara funcionando", icon: Camera, checked: true },
  { id: "mic", label: "Microfono activo", icon: Mic, checked: true },
  { id: "light", label: "Iluminacion adecuada", icon: Sun, checked: true },
  { id: "connection", label: "Conexion estable", icon: Wifi, checked: true },
  { id: "headphones", label: "Auriculares (opcional)", icon: Headphones, checked: false, optional: true },
]

const interviewQuestions = [
  "Hola Sofia, soy Alex tu entrevistador IA. Como estuvo tu semana?",
  "Cuentame sobre un proyecto del que te sientas orgullosa.",
  "En la simulacion tomaste la decision de priorizar el bug sobre el feature. Por que?",
  "Como manejas la presion cuando hay fechas limite ajustadas?",
  "Que tipo de ambiente de trabajo te hace mas productiva?",
  "Tienes alguna pregunta sobre TechCorp o el rol?",
]

const analysisMetrics = [
  { id: "tone", label: "Tono de voz", value: "Seguro", color: "#10B981" },
  { id: "speed", label: "Velocidad", value: "Normal", color: "#06B6D4" },
  { id: "contact", label: "Contacto visual", value: "85%", color: "#7C3AED" },
  { id: "confidence", label: "Confianza", value: "Alta", color: "#10B981" },
]

export function InterviewScreen({ onNavigate, jobId, onSimulationCreated }: InterviewScreenProps) {
  const [state, setState] = useState<InterviewState>("prep")
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [timer, setTimer] = useState(0)
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [processingStep, setProcessingStep] = useState(0)
  const [questions, setQuestions] = useState(interviewQuestions)
  const [simulationId, setSimulationId] = useState<string | null>(null)
  const [videoScores, setVideoScores] = useState<any[]>([])
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const captureIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const processingSteps = [
    "Analizando lenguaje corporal...",
    "Evaluando comunicacion...",
    "Procesando respuestas...",
    "Generando reporte personalizado...",
  ]

  // Timer
  useEffect(() => {
    if (state === "live" && !isPaused) {
      const interval = setInterval(() => {
        setTimer((prev) => prev + 1)
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [state, isPaused])

  // Processing animation
  useEffect(() => {
    if (state === "processing") {
      const interval = setInterval(() => {
        setProcessingStep((prev) => {
          if (prev >= processingSteps.length - 1) {
            clearInterval(interval)
            setTimeout(() => {
              setState("complete")
            }, 1000)
            return prev
          }
          return prev + 1
        })
      }, 1500)
      return () => clearInterval(interval)
    }
  }, [state])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const startWebcam = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      streamRef.current = stream
      if (videoRef.current) videoRef.current.srcObject = stream
    } catch {}
  }, [])

  const captureAndAnalyze = useCallback(async () => {
    if (!videoRef.current || !simulationId) return
    const canvas = document.createElement("canvas")
    canvas.width = 320
    canvas.height = 240
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.drawImage(videoRef.current, 0, 0, 320, 240)
    canvas.toBlob(async (blob) => {
      if (!blob) return
      try {
        const { getSession } = await import("@/modules/auth/client-actions")
        const session = await getSession()
        const formData = new FormData()
        formData.append("file", blob, "frame.jpg")
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000"}/api/v1/video/analyze`, {
          method: "POST",
          headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {},
          body: formData,
        })
        if (res.ok) {
          const score = await res.json()
          setVideoScores((prev) => [...prev, score])
        }
      } catch {}
    }, "image/jpeg", 0.7)
  }, [simulationId])

  const handleStartInterview = async () => {
    await startWebcam()
    if (jobId) {
      try {
        const { api } = await import("@/lib/api-client")
        const sim = await api.post<{ id: string }>("/api/v1/simulations/", { job_id: jobId })
        setSimulationId(sim.id)
        onSimulationCreated?.(sim.id)
        const qs = await api.get<{ questions: any[] }>(`/api/v1/simulations/${sim.id}/questions`)
        if (qs.questions?.length) setQuestions(qs.questions.map((q: any) => q.question))
      } catch {}
    }
    setState("live")
    captureIntervalRef.current = setInterval(captureAndAnalyze, 10000)
  }

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      handleEndInterview()
    }
  }

  const handleEndInterview = async () => {
    if (captureIntervalRef.current) clearInterval(captureIntervalRef.current)
    streamRef.current?.getTracks().forEach((t) => t.stop())
    setState("processing")
    if (simulationId && videoScores.length > 0) {
      const avg = (key: string) => Math.round(videoScores.reduce((s, v) => s + (v[key] ?? 70), 0) / videoScores.length)
      try {
        const { api } = await import("@/lib/api-client")
        await api.post(`/api/v1/simulations/${simulationId}/result`, {
          overall_score: avg("overall_score"),
          confidence: avg("confidence"),
          eye_contact: avg("eye_contact"),
          body_language: avg("body_language"),
          video_scores: videoScores,
        })
      } catch {}
    }
  }

  if (state === "prep") {
    return (
      <div className="min-h-screen flex flex-col px-6 py-8 safe-area-top safe-area-bottom">
        {/* Back button */}
        <button
          onClick={() => onNavigate("home")}
          className="flex items-center gap-2 text-[#94A3B8] hover:text-[#F1F5F9] transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Volver
        </button>

        <h1 className="text-2xl font-semibold text-[#F1F5F9] mb-2">Preparacion para entrevista</h1>
        <p className="text-[#94A3B8] text-sm mb-8">Verifica que todo este listo antes de comenzar</p>

        {/* Checklist */}
        <div className="glass rounded-2xl p-4 mb-6">
          <h3 className="text-[#F1F5F9] font-medium mb-4">Checklist pre-entrevista</h3>
          <div className="space-y-3">
            {checklistItems.map((item) => {
              const Icon = item.icon
              return (
                <div key={item.id} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    item.checked ? "bg-[#10B981]/20" : "bg-[#1A1A2E]"
                  }`}>
                    {item.checked ? (
                      <CheckCircle className="w-4 h-4 text-[#10B981]" />
                    ) : (
                      <Icon className="w-4 h-4 text-[#475569]" />
                    )}
                  </div>
                  <span className={`text-sm ${item.checked ? "text-[#F1F5F9]" : "text-[#475569]"}`}>
                    {item.label}
                  </span>
                  {item.optional && (
                    <span className="text-[#475569] text-xs">(opcional)</span>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Info */}
        <div className="glass rounded-2xl p-4 mb-6">
          <h3 className="text-[#F1F5F9] font-medium mb-3">Informacion de la entrevista</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[#94A3B8]">Duracion estimada</span>
              <span className="text-[#F1F5F9]">15-25 minutos</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#94A3B8]">Preguntas</span>
              <span className="text-[#F1F5F9]">6-10 dinamicas</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#94A3B8]">Evalua</span>
              <span className="text-[#F1F5F9]">Comunicacion, liderazgo, confianza</span>
            </div>
          </div>
        </div>

        {/* Privacy notice */}
        <div className="glass rounded-2xl p-4 mb-auto">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-[#F59E0B] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[#F1F5F9] text-sm font-medium mb-1">Privacidad</p>
              <p className="text-[#94A3B8] text-xs leading-relaxed">
                La grabacion solo es compartida con TechCorp con tu permiso. 
                No evaluamos apariencia fisica, acento o idioma nativo.
              </p>
            </div>
          </div>
        </div>

        {/* Permission checkbox */}
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

        {/* Start button */}
        <Button
          onClick={handleStartInterview}
          disabled={!acceptedTerms}
          className={`w-full h-14 font-medium text-base flex items-center justify-center gap-2 ${
            acceptedTerms
              ? "btn-primary-gradient text-[#F1F5F9]"
              : "bg-[#1A1A2E] text-[#475569] cursor-not-allowed"
          }`}
        >
          <Video className="w-5 h-5" />
          Iniciar entrevista
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

          {/* Progress */}
          <div className="w-full max-w-xs mx-auto">
            <div className="h-2 bg-[#1A1A2E] rounded-full overflow-hidden mb-4">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${((processingStep + 1) / processingSteps.length) * 100}%` }}
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
        <p className="text-[#94A3B8] text-center mb-8">Tu reporte de entrevista esta disponible</p>

        <Button
          onClick={() => onNavigate("report")}
          className="w-full max-w-xs h-14 btn-primary-gradient text-[#F1F5F9] font-medium"
        >
          Ver mi reporte
        </Button>
      </div>
    )
  }

  // Live interview
  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A12]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 glass">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#EF4444] animate-pulse" />
          <span className="text-[#EF4444] text-xs font-medium">Grabando</span>
        </div>
        <span className="text-[#F1F5F9] font-mono text-sm">{formatTime(timer)}</span>
        <span className="text-[#94A3B8] text-xs">
          Pregunta {currentQuestion + 1} de {questions.length}
        </span>
      </div>

      {/* Main view */}
      <div className="flex-1 flex flex-col">
        {/* AI Interviewer */}
        <div className="flex-1 flex items-center justify-center relative">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#06B6D4] flex items-center justify-center">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-24 h-24 rounded-full bg-[#0A0A12] flex items-center justify-center"
            >
              <span className="text-3xl font-bold bg-gradient-to-br from-[#7C3AED] to-[#06B6D4] bg-clip-text text-transparent">
                AI
              </span>
            </motion.div>
          </div>

          {/* Interviewer name */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center">
            <p className="text-[#F1F5F9] font-medium">Alex</p>
            <p className="text-[#94A3B8] text-xs">Entrevistador IA de HYRE</p>
          </div>
        </div>

        {/* Question/Subtitle */}
        <div className="px-6 py-4 glass mx-4 mb-4 rounded-xl">
          <AnimatePresence mode="wait">
            <motion.p
              key={currentQuestion}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-[#F1F5F9] text-center text-sm leading-relaxed"
            >
              {questions[currentQuestion]}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Analysis sidebar */}
        <div className="px-4 mb-4">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {analysisMetrics.map((metric) => (
              <div key={metric.id} className="flex-shrink-0 px-3 py-2 glass rounded-lg">
                <p className="text-[#94A3B8] text-xs">{metric.label}</p>
                <p className="font-medium text-sm" style={{ color: metric.color }}>
                  {metric.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* User camera preview */}
        <div className="absolute bottom-32 right-4 w-24 h-32 rounded-xl overflow-hidden glass">
          {isVideoOff ? (
            <div className="w-full h-full bg-[#1A1A2E] flex items-center justify-center">
              <VideoOff className="w-8 h-8 text-[#475569]" />
            </div>
          ) : (
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="px-6 pb-8 safe-area-bottom">
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
            className="flex-1 h-12 btn-primary-gradient text-[#F1F5F9] font-medium"
          >
            {currentQuestion < interviewQuestions.length - 1 ? "Siguiente pregunta" : "Finalizar"}
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
