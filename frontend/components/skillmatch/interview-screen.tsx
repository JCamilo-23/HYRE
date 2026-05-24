"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Video, VideoOff, Mic, MicOff, Camera, Sun, Wifi, Headphones,
  CheckCircle, AlertCircle, ArrowLeft, Loader2, Send, User, Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Screen } from "@/lib/hyre-types"
import { useSpeechRecognition } from "@/modules/ai-interview/use-speech-recognition"

interface InterviewScreenProps {
  onNavigate: (screen: Screen) => void
}

type Stage = "prep" | "live" | "processing" | "report"

interface Message {
  role: "user" | "assistant"
  content: string
}

interface Report {
  score: number
  hire_probability: number
  dimensions: Record<string, number>
  strengths: string[]
  improvements: string[]
  summary: string
  recommendation: string
}

const checklistItems = [
  { id: "camera", label: "Cámara funcionando", icon: Camera },
  { id: "mic", label: "Micrófono activo", icon: Mic },
  { id: "light", label: "Iluminación adecuada", icon: Sun },
  { id: "connection", label: "Conexión estable", icon: Wifi },
  { id: "headphones", label: "Auriculares (opcional)", icon: Headphones, optional: true },
]

const JOB_CONTEXT = "Desarrollador Full Stack — HYRE"

export function InterviewScreen({ onNavigate }: InterviewScreenProps) {
  const [stage, setStage] = useState<Stage>("prep")
  const [accepted, setAccepted] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [report, setReport] = useState<Report | null>(null)
  const [timer, setTimer] = useState(0)

  // Camera / mic state
  const videoRef = useRef<HTMLVideoElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [micOn, setMicOn] = useState(true)
  const [cameraOn, setCameraOn] = useState(true)
  const [mediaError, setMediaError] = useState<string | null>(null)

  const bottomRef = useRef<HTMLDivElement>(null)
  const messagesRef = useRef<Message[]>([])

  // Referencia para handleSend accesible desde el callback de STT
  const pendingTranscriptRef = useRef<string>("")
  const autoSendTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const triggerSend = useCallback((text: string) => {
    if (!text.trim()) return
    setInput("")
    pendingTranscriptRef.current = ""
    const updated: Message[] = [...messagesRef.current, { role: "user", content: text.trim() }]
    setMessages(updated)
    setLoading(true)
    fetch("/api/interviews/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ history: updated, jobContext: JOB_CONTEXT }),
    })
      .then(r => r.json())
      .then(({ reply, finished }: { reply: string; finished?: boolean }) => {
        const final: Message[] = [...updated, { role: "assistant", content: reply }]
        setMessages(final)
        messagesRef.current = final
        setLoading(false)
        if (finished) setTimeout(() => generateReport(final), 1200)
      })
      .catch(() => setLoading(false))
  }, [])

  // Speech-to-text — transcribe y envía automáticamente tras pausa de 1.5s
  const { supported: sttSupported, listening: sttListening, interim: sttInterim, toggle: toggleStt } = useSpeechRecognition({
    lang: "es-ES",
    onFinalTranscript: (text) => {
      if (autoSendTimerRef.current) clearTimeout(autoSendTimerRef.current)
      pendingTranscriptRef.current = (pendingTranscriptRef.current + " " + text).trim()
      setInput(pendingTranscriptRef.current)
      autoSendTimerRef.current = setTimeout(() => {
        const toSend = pendingTranscriptRef.current
        if (toSend) triggerSend(toSend)
      }, 1500)
    },
    onInterimTranscript: (text) => setInput((pendingTranscriptRef.current + " " + text).trim()),
  })

  // Timer
  useEffect(() => {
    if (stage !== "live") return
    const id = setInterval(() => setTimer((t) => t + 1), 1000)
    return () => clearInterval(id)
  }, [stage])

  // Sync ref con state para callbacks
  useEffect(() => { messagesRef.current = messages }, [messages])

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Camera setup when live starts
  useEffect(() => {
    if (stage !== "live") return
    let active = true
    let mediaStream: MediaStream | null = null

    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((media) => {
        if (!active) { media.getTracks().forEach(t => t.stop()); return }
        mediaStream = media
        setStream(media)
        if (videoRef.current) videoRef.current.srcObject = media
      })
      .catch((err) => {
        const name = err instanceof DOMException ? err.name : ""
        if (name === "NotAllowedError" || name === "PermissionDeniedError") {
          setMediaError("Permiso de cámara denegado. Puedes continuar escribiendo.")
        } else {
          setMediaError("No se encontró cámara. Puedes continuar escribiendo.")
        }
      })

    return () => {
      active = false
      mediaStream?.getTracks().forEach(t => t.stop())
    }
  }, [stage])

  const formatTime = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`

  const handleToggleMic = useCallback(() => {
    setMicOn(prev => {
      stream?.getAudioTracks().forEach(t => { t.enabled = !prev })
      return !prev
    })
  }, [stream])

  const handleToggleCamera = useCallback(() => {
    setCameraOn(prev => {
      stream?.getVideoTracks().forEach(t => { t.enabled = !prev })
      return !prev
    })
  }, [stream])

  const handleStart = async () => {
    setLoading(true)
    const res = await fetch("/api/interviews/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ history: [], jobContext: JOB_CONTEXT }),
    })
    const { reply } = await res.json()
    const initial = [{ role: "assistant" as const, content: reply }]
    setMessages(initial)
    messagesRef.current = initial
    setLoading(false)
    setStage("live")
  }

  const handleSend = () => {
    const text = input.replace(/\s*\[.*?\]\s*$/, "").trim()
    if (!text || loading) return
    if (autoSendTimerRef.current) clearTimeout(autoSendTimerRef.current)
    triggerSend(text)
  }

  const generateReport = useCallback(async (history: Message[]) => {
    if (autoSendTimerRef.current) clearTimeout(autoSendTimerRef.current)
    stream?.getTracks().forEach(t => t.stop())
    setStream(null)
    setStage("processing")
    const res = await fetch("/api/interviews/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ history, jobContext: JOB_CONTEXT }),
    })
    const data = await res.json()
    setReport(data)
    setStage("report")
  }, [stream])

  // ── PREP ──────────────────────────────────────────────────────────────────
  if (stage === "prep") {
    return (
      <div className="min-h-screen flex flex-col px-6 py-8 safe-area-top safe-area-bottom">
        <button
          onClick={() => onNavigate("home")}
          className="flex items-center gap-2 text-[#94A3B8] hover:text-[#F1F5F9] transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" /> Volver
        </button>

        <h1 className="text-2xl font-semibold text-[#F1F5F9] mb-2">Entrevista con IA</h1>
        <p className="text-[#94A3B8] text-sm mb-8">Practica con nuestro entrevistador IA impulsado por Gemini</p>

        <div className="glass rounded-2xl p-4 mb-6">
          <h3 className="text-[#F1F5F9] font-medium mb-4">Checklist pre-entrevista</h3>
          <div className="space-y-3">
            {checklistItems.map(({ id, label, icon: Icon, optional }) => (
              <div key={id} className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${optional ? "bg-[#1A1A2E]" : "bg-[#10B981]/20"}`}>
                  {optional ? <Icon className="w-4 h-4 text-[#475569]" /> : <CheckCircle className="w-4 h-4 text-[#10B981]" />}
                </div>
                <span className={`text-sm ${optional ? "text-[#475569]" : "text-[#F1F5F9]"}`}>{label}</span>
                {optional && <span className="text-[#475569] text-xs">(opcional)</span>}
              </div>
            ))}
          </div>
        </div>

        <div className="glass rounded-2xl p-4 mb-6">
          <h3 className="text-[#F1F5F9] font-medium mb-3">Información</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[#94A3B8]">Duración estimada</span>
              <span className="text-[#F1F5F9]">15-20 minutos</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#94A3B8]">Preguntas</span>
              <span className="text-[#F1F5F9]">6-8 dinámicas</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#94A3B8]">Powered by</span>
              <span className="text-[#7C3AED] font-medium">Gemini AI</span>
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-4 mb-auto">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-[#F59E0B] flex-shrink-0 mt-0.5" />
            <p className="text-[#94A3B8] text-xs leading-relaxed">
              Esta es una entrevista de práctica con IA. Tus respuestas se usan para generar retroalimentación personalizada.
            </p>
          </div>
        </div>

        <label className="flex items-start gap-3 my-4 cursor-pointer">
          <input
            type="checkbox"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
            className="mt-1 w-4 h-4 rounded border-[#475569] bg-[#1A1A2E] text-[#7C3AED] focus:ring-[#7C3AED]"
          />
          <span className="text-[#94A3B8] text-sm">Acepto que mis respuestas sean analizadas por IA</span>
        </label>

        <Button
          onClick={handleStart}
          disabled={!accepted || loading}
          className={`w-full h-14 font-medium text-base flex items-center justify-center gap-2 ${accepted && !loading ? "btn-primary-gradient text-[#F1F5F9]" : "bg-[#1A1A2E] text-[#475569] cursor-not-allowed"}`}
        >
          {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Iniciando...</> : <><Video className="w-5 h-5" /> Iniciar entrevista</>}
        </Button>
      </div>
    )
  }

  // ── PROCESSING ────────────────────────────────────────────────────────────
  if (stage === "processing") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#7C3AED]/20 flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-[#7C3AED] animate-spin" />
          </div>
          <h1 className="text-xl font-semibold text-[#F1F5F9] mb-2">Entrevista completada</h1>
          <p className="text-[#94A3B8]">Gemini está analizando tus respuestas...</p>
        </motion.div>
      </div>
    )
  }

  // ── REPORT ────────────────────────────────────────────────────────────────
  if (stage === "report" && report) {
    const recColor = report.recommendation === "CONTRATAR" ? "#10B981" : report.recommendation === "CONSIDERAR" ? "#F59E0B" : "#EF4444"
    return (
      <div className="min-h-screen flex flex-col px-6 py-8 safe-area-top safe-area-bottom overflow-y-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="text-center mb-8">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-[#7C3AED]/20 flex items-center justify-center">
              <span className="text-3xl font-bold text-[#7C3AED]">{report.score}</span>
            </div>
            <h1 className="text-2xl font-semibold text-[#F1F5F9] mb-1">Tu reporte</h1>
            <span className="text-sm font-medium px-3 py-1 rounded-full" style={{ color: recColor, backgroundColor: `${recColor}20` }}>
              {report.recommendation}
            </span>
          </div>

          <div className="glass rounded-2xl p-4 mb-4">
            <p className="text-[#94A3B8] text-sm leading-relaxed">{report.summary}</p>
          </div>

          <div className="glass rounded-2xl p-4 mb-4">
            <h3 className="text-[#F1F5F9] font-medium mb-3">Dimensiones</h3>
            <div className="space-y-3">
              {Object.entries(report.dimensions).map(([key, val]) => (
                <div key={key}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-[#94A3B8] capitalize">{key.replace(/_/g, " ")}</span>
                    <span className="text-[#F1F5F9]">{val}%</span>
                  </div>
                  <div className="h-1.5 bg-[#1A1A2E] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${val}%` }}
                      transition={{ delay: 0.3, duration: 0.8 }}
                      className="h-full bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] rounded-full"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass rounded-2xl p-4 mb-4">
            <h3 className="text-[#10B981] font-medium mb-2">Fortalezas</h3>
            <ul className="space-y-1">
              {report.strengths.map((s, i) => (
                <li key={i} className="text-[#94A3B8] text-sm flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-[#10B981] mt-0.5 shrink-0" />{s}
                </li>
              ))}
            </ul>
          </div>

          <div className="glass rounded-2xl p-4 mb-8">
            <h3 className="text-[#F59E0B] font-medium mb-2">Áreas de mejora</h3>
            <ul className="space-y-1">
              {report.improvements.map((s, i) => (
                <li key={i} className="text-[#94A3B8] text-sm flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-[#F59E0B] mt-0.5 shrink-0" />{s}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => { setStage("prep"); setMessages([]); setTimer(0); setReport(null) }}
              variant="outline"
              className="flex-1 h-12 glass border-white/15 text-[#F1F5F9]"
            >
              Reintentar
            </Button>
            <Button onClick={() => onNavigate("home")} className="flex-1 h-12 btn-primary-gradient text-[#F1F5F9]">
              Volver al inicio
            </Button>
          </div>
        </motion.div>
      </div>
    )
  }

  // ── LIVE ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A12]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 glass shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#EF4444] animate-pulse" />
          <span className="text-[#EF4444] text-xs font-medium">Grabando</span>
        </div>
        <span className="text-[#F1F5F9] font-mono text-sm">{formatTime(timer)}</span>
        <span className="text-[#94A3B8] text-xs">{messages.filter(m => m.role === "assistant").length} / 8</span>
      </div>

      {/* Camera + chat area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">

        {/* Camera preview */}
        <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-[#1A1A2E] mb-2">
          {cameraOn && !mediaError ? (
            <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2">
              <VideoOff className="w-10 h-10 text-[#475569]" />
              {mediaError && <p className="text-xs text-[#475569] text-center px-4">{mediaError}</p>}
            </div>
          )}

          {/* AI avatar overlay */}
          <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-black/50 rounded-full px-3 py-1.5">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#06B6D4] flex items-center justify-center">
              <span className="text-white text-[10px] font-bold">AI</span>
            </div>
            <span className="text-white text-xs">Alex — Entrevistador IA</span>
          </div>

          {/* Mic / camera controls overlay */}
          <div className="absolute bottom-3 right-3 flex gap-2">
            <button
              onClick={handleToggleMic}
              className={`w-8 h-8 rounded-full flex items-center justify-center ${micOn ? "bg-white/20" : "bg-[#EF4444]"}`}
            >
              {micOn ? <Mic className="w-4 h-4 text-white" /> : <MicOff className="w-4 h-4 text-white" />}
            </button>
            <button
              onClick={handleToggleCamera}
              className={`w-8 h-8 rounded-full flex items-center justify-center ${cameraOn ? "bg-white/20" : "bg-[#EF4444]"}`}
            >
              {cameraOn ? <Video className="w-4 h-4 text-white" /> : <VideoOff className="w-4 h-4 text-white" />}
            </button>
          </div>
        </div>

        {/* Chat messages */}
        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === "assistant" ? "bg-gradient-to-br from-[#7C3AED] to-[#06B6D4]" : "bg-[#1A1A2E]"}`}>
                {msg.role === "assistant"
                  ? <span className="text-white text-xs font-bold">AI</span>
                  : <User className="w-4 h-4 text-[#94A3B8]" />}
              </div>
              <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${msg.role === "assistant" ? "bg-[#1A1A2E] text-[#F1F5F9]" : "bg-[#7C3AED] text-white"}`}>
                {msg.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#06B6D4] flex items-center justify-center shrink-0">
              <span className="text-white text-xs font-bold">AI</span>
            </div>
            <div className="bg-[#1A1A2E] px-4 py-3 rounded-2xl flex gap-1 items-center">
              <span className="w-2 h-2 bg-[#7C3AED] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-2 h-2 bg-[#7C3AED] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-2 h-2 bg-[#7C3AED] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 pb-6 pt-3 glass shrink-0">
        {sttListening && sttInterim && (
          <p className="text-xs text-[#7C3AED] mb-1 px-1">🎙 {sttInterim}</p>
        )}
        <div className="flex gap-2">
          {sttSupported && (
            <button
              onClick={toggleStt}
              className={`w-10 h-10 self-end rounded-full flex items-center justify-center shrink-0 ${sttListening ? "bg-[#EF4444] animate-pulse" : "bg-white/10"}`}
            >
              <Mic className="w-4 h-4 text-white" />
            </button>
          )}
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend() } }}
            placeholder={sttSupported ? "Habla o escribe tu respuesta..." : "Escribe tu respuesta..."}
            rows={2}
            className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-[#64748B] focus:border-[#7C3AED]/50 focus:outline-none resize-none"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="w-10 h-10 self-end rounded-full bg-gradient-to-br from-[#7C3AED] to-[#9F67FF] flex items-center justify-center disabled:opacity-40"
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>
        <button
          onClick={() => generateReport(messages)}
          className="mt-2 w-full text-xs text-[#475569] hover:text-[#94A3B8] transition-colors"
        >
          Terminar entrevista anticipadamente
        </button>
      </div>
    </div>
  )
}
