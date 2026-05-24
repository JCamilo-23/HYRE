"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Video, VideoOff, Mic, MicOff, Camera, Sun, Wifi, Headphones,
  CheckCircle, AlertCircle, ArrowLeft, Loader2, Send, User, Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Screen } from "@/lib/hyre-types"

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

function pickMimeType(): string {
  const types = ["audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus", "audio/ogg"]
  return types.find((t) => MediaRecorder.isTypeSupported(t)) ?? ""
}

export function InterviewScreen({ onNavigate }: InterviewScreenProps) {
  const [stage, setStage] = useState<Stage>("prep")
  const [accepted, setAccepted] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [report, setReport] = useState<Report | null>(null)
  const [timer, setTimer] = useState(0)
  const [micOn, setMicOn] = useState(true)
  const [cameraOn, setCameraOn] = useState(true)
  const [mediaError, setMediaError] = useState<string | null>(null)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)

  // Refs — stable across renders
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const messagesRef = useRef<Message[]>([])
  const loadingRef = useRef(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const pendingRef = useRef("")
  const autoSendTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // MediaRecorder + VAD refs
  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const audioCtxRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const vadIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const wasSpeakingRef = useRef(false)
  const transcribeRef = useRef<(() => void) | null>(null)
  const micOnRef = useRef(true)

  // Sync refs with state
  useEffect(() => { messagesRef.current = messages }, [messages])
  useEffect(() => { loadingRef.current = loading }, [loading])
  useEffect(() => { micOnRef.current = micOn }, [micOn])

  // Timer
  useEffect(() => {
    if (stage !== "live") return
    const id = setInterval(() => setTimer((t) => t + 1), 1000)
    return () => clearInterval(id)
  }, [stage])

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Camera + MediaRecorder + VAD — only when live
  useEffect(() => {
    if (stage !== "live") return
    let active = true

    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((media) => {
        if (!active) { media.getTracks().forEach((t) => t.stop()); return }
        streamRef.current = media
        if (videoRef.current) videoRef.current.srcObject = media

        // ── MediaRecorder ──────────────────────────────────────────────
        const mime = pickMimeType()
        const recorder = new MediaRecorder(media, mime ? { mimeType: mime } : undefined)
        recorderRef.current = recorder
        chunksRef.current = []

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunksRef.current.push(e.data)
        }
        recorder.start(300) // chunk every 300 ms

        // ── AudioContext VAD ───────────────────────────────────────────
        const ctx = new AudioContext()
        audioCtxRef.current = ctx
        const source = ctx.createMediaStreamSource(media)
        const analyser = ctx.createAnalyser()
        analyser.fftSize = 256
        source.connect(analyser)
        analyserRef.current = analyser

        const freqData = new Uint8Array(analyser.frequencyBinCount)
        const SPEECH_THRESHOLD = 18  // 0-255
        const SILENCE_MS = 1200

        vadIntervalRef.current = setInterval(() => {
          if (!analyserRef.current || !micOnRef.current) return
          analyserRef.current.getByteFrequencyData(freqData)
          const avg = freqData.reduce((a, b) => a + b, 0) / freqData.length

          if (avg > SPEECH_THRESHOLD) {
            wasSpeakingRef.current = true
            setIsSpeaking(true)
            if (silenceTimerRef.current) { clearTimeout(silenceTimerRef.current); silenceTimerRef.current = null }
          } else if (wasSpeakingRef.current && !silenceTimerRef.current) {
            setIsSpeaking(false)
            silenceTimerRef.current = setTimeout(() => {
              wasSpeakingRef.current = false
              silenceTimerRef.current = null
              transcribeRef.current?.()
            }, SILENCE_MS)
          }
        }, 100)
      })
      .catch((err) => {
        const name = err instanceof DOMException ? err.name : ""
        setMediaError(
          name === "NotAllowedError" || name === "PermissionDeniedError"
            ? "Permiso de cámara denegado."
            : "No se encontró cámara o micrófono.",
        )
      })

    return () => {
      active = false
      if (vadIntervalRef.current) { clearInterval(vadIntervalRef.current); vadIntervalRef.current = null }
      if (silenceTimerRef.current) { clearTimeout(silenceTimerRef.current); silenceTimerRef.current = null }
      recorderRef.current?.stop()
      recorderRef.current = null
      audioCtxRef.current?.close()
      audioCtxRef.current = null
      analyserRef.current = null
      streamRef.current?.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
  }, [stage])

  // Restore srcObject when camera re-enabled
  useEffect(() => {
    if (cameraOn && streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current
    }
  }, [cameraOn])

  // ── Core callbacks ────────────────────────────────────────────────────────

  const doSend = useCallback((text: string) => {
    const trimmed = text.trim()
    if (!trimmed || loadingRef.current) return
    setInput("")
    pendingRef.current = ""
    const updated: Message[] = [...messagesRef.current, { role: "user", content: trimmed }]
    setMessages(updated)
    messagesRef.current = updated
    loadingRef.current = true
    setLoading(true)

    fetch("/api/interviews/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ history: updated, jobContext: JOB_CONTEXT }),
    })
      .then((r) => r.json())
      .then(({ reply, finished }: { reply: string; finished?: boolean }) => {
        const final: Message[] = [...updated, { role: "assistant", content: reply }]
        setMessages(final)
        messagesRef.current = final
        loadingRef.current = false
        setLoading(false)
        if (finished) setTimeout(() => doGenerateReport(final), 1200)
      })
      .catch(() => { loadingRef.current = false; setLoading(false) })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const doGenerateReport = useCallback(async (history: Message[]) => {
    if (autoSendTimer.current) clearTimeout(autoSendTimer.current)
    if (vadIntervalRef.current) { clearInterval(vadIntervalRef.current); vadIntervalRef.current = null }
    if (silenceTimerRef.current) { clearTimeout(silenceTimerRef.current); silenceTimerRef.current = null }
    recorderRef.current?.stop()
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    setStage("processing")
    try {
      const res = await fetch("/api/interviews/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ history, jobContext: JOB_CONTEXT }),
      })
      setReport(await res.json())
    } catch { /* fallback from backend */ }
    setStage("report")
  }, [])

  // Gemini transcription — called by VAD after silence
  const transcribeAudio = useCallback(() => {
    const chunks = [...chunksRef.current]
    chunksRef.current = []
    if (chunks.length < 2) return

    const mime = chunks[0].type || "audio/webm"
    const blob = new Blob(chunks, { type: mime })
    if (blob.size < 600) return

    setIsTranscribing(true)
    const reader = new FileReader()
    reader.onloadend = async () => {
      const b64 = (reader.result as string).split(",")[1]
      try {
        const res = await fetch("/api/interviews/transcribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ audio: b64, mimeType: mime }),
        })
        const { text }: { text: string } = await res.json()
        if (text?.trim()) {
          pendingRef.current = (pendingRef.current + " " + text).trim()
          setInput(pendingRef.current)
          if (autoSendTimer.current) clearTimeout(autoSendTimer.current)
          autoSendTimer.current = setTimeout(() => {
            const t = pendingRef.current
            pendingRef.current = ""
            if (t && !loadingRef.current) doSend(t)
          }, 2500)
        }
      } catch { /* silent */ }
      setIsTranscribing(false)
    }
    reader.readAsDataURL(blob)
  }, [doSend])

  // Keep transcribeRef in sync so the VAD interval can call it without stale closure
  useEffect(() => { transcribeRef.current = transcribeAudio }, [transcribeAudio])

  const handleToggleMic = useCallback(() => {
    setMicOn((prev) => {
      streamRef.current?.getAudioTracks().forEach((t) => { t.enabled = prev }) // toggle: if was true, disable
      return !prev
    })
  }, [])

  const handleToggleCamera = useCallback(() => {
    setCameraOn((prev) => {
      const next = !prev
      streamRef.current?.getVideoTracks().forEach((t) => { t.enabled = next })
      return next
    })
  }, [])

  const handleSend = useCallback(() => {
    if (autoSendTimer.current) clearTimeout(autoSendTimer.current)
    const text = input.trim()
    if (!text) return
    doSend(text)
  }, [input, doSend])

  const handleStart = async () => {
    setLoading(true)
    const res = await fetch("/api/interviews/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ history: [], jobContext: JOB_CONTEXT }),
    })
    const { reply } = await res.json()
    const initial: Message[] = [{ role: "assistant", content: reply }]
    setMessages(initial)
    messagesRef.current = initial
    setLoading(false)
    setStage("live")
  }

  const formatTime = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`

  // ── PREP ──────────────────────────────────────────────────────────────────
  if (stage === "prep") {
    return (
      <div className="min-h-screen flex flex-col px-6 py-8 safe-area-top safe-area-bottom">
        <button onClick={() => onNavigate("home")} className="flex items-center gap-2 text-[#94A3B8] hover:text-[#F1F5F9] transition-colors mb-6">
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
            <div className="flex justify-between"><span className="text-[#94A3B8]">Duración estimada</span><span className="text-[#F1F5F9]">15-20 minutos</span></div>
            <div className="flex justify-between"><span className="text-[#94A3B8]">Preguntas</span><span className="text-[#F1F5F9]">6-8 dinámicas</span></div>
            <div className="flex justify-between"><span className="text-[#94A3B8]">Powered by</span><span className="text-[#7C3AED] font-medium">Gemini AI</span></div>
          </div>
        </div>

        <div className="glass rounded-2xl p-4 mb-auto">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-[#F59E0B] flex-shrink-0 mt-0.5" />
            <p className="text-[#94A3B8] text-xs leading-relaxed">Esta es una entrevista de práctica con IA. Tus respuestas se usan para generar retroalimentación personalizada.</p>
          </div>
        </div>

        <label className="flex items-start gap-3 my-4 cursor-pointer">
          <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)}
            className="mt-1 w-4 h-4 rounded border-[#475569] bg-[#1A1A2E] text-[#7C3AED] focus:ring-[#7C3AED]" />
          <span className="text-[#94A3B8] text-sm">Acepto que mis respuestas sean analizadas por IA</span>
        </label>

        <Button onClick={handleStart} disabled={!accepted || loading}
          className={`w-full h-14 font-medium text-base flex items-center justify-center gap-2 ${accepted && !loading ? "btn-primary-gradient text-[#F1F5F9]" : "bg-[#1A1A2E] text-[#475569] cursor-not-allowed"}`}>
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
            <span className="text-sm font-medium px-3 py-1 rounded-full" style={{ color: recColor, backgroundColor: `${recColor}20` }}>{report.recommendation}</span>
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
                    <motion.div initial={{ width: 0 }} animate={{ width: `${val}%` }} transition={{ delay: 0.3, duration: 0.8 }}
                      className="h-full bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass rounded-2xl p-4 mb-4">
            <h3 className="text-[#10B981] font-medium mb-2">Fortalezas</h3>
            <ul className="space-y-1">
              {report.strengths.map((s, i) => <li key={i} className="text-[#94A3B8] text-sm flex items-start gap-2"><CheckCircle className="w-4 h-4 text-[#10B981] mt-0.5 shrink-0" />{s}</li>)}
            </ul>
          </div>

          <div className="glass rounded-2xl p-4 mb-8">
            <h3 className="text-[#F59E0B] font-medium mb-2">Áreas de mejora</h3>
            <ul className="space-y-1">
              {report.improvements.map((s, i) => <li key={i} className="text-[#94A3B8] text-sm flex items-start gap-2"><Sparkles className="w-4 h-4 text-[#F59E0B] mt-0.5 shrink-0" />{s}</li>)}
            </ul>
          </div>

          <div className="flex gap-3">
            <Button onClick={() => { setStage("prep"); setMessages([]); setTimer(0); setReport(null) }}
              variant="outline" className="flex-1 h-12 glass border-white/15 text-[#F1F5F9]">Reintentar</Button>
            <Button onClick={() => onNavigate("home")} className="flex-1 h-12 btn-primary-gradient text-[#F1F5F9]">Volver al inicio</Button>
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
        <span className="text-[#94A3B8] text-xs">{messages.filter((m) => m.role === "assistant").length} / 8</span>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* Camera — always mounted, CSS controls visibility */}
        <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-[#1A1A2E] mb-2">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className={`w-full h-full object-cover ${cameraOn && !mediaError ? "" : "hidden"}`}
          />
          {(!cameraOn || mediaError) && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
              <VideoOff className="w-10 h-10 text-[#475569]" />
              {mediaError && <p className="text-xs text-[#475569] text-center px-4">{mediaError}</p>}
            </div>
          )}

          {/* AI label */}
          <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-black/50 rounded-full px-3 py-1.5">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#06B6D4] flex items-center justify-center">
              <span className="text-white text-[10px] font-bold">AI</span>
            </div>
            <span className="text-white text-xs">Alex — Entrevistador IA</span>
          </div>

          {/* Speech indicator */}
          {isSpeaking && (
            <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/60 rounded-full px-2.5 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
              <span className="w-1.5 h-3 rounded-full bg-[#10B981] animate-pulse" style={{ animationDelay: "100ms" }} />
              <span className="w-1.5 h-2 rounded-full bg-[#10B981] animate-pulse" style={{ animationDelay: "200ms" }} />
            </div>
          )}

          {/* Controls */}
          <div className="absolute bottom-3 right-3 flex gap-2">
            <button onClick={handleToggleMic} className={`w-8 h-8 rounded-full flex items-center justify-center ${micOn ? "bg-white/20" : "bg-[#EF4444]"}`}>
              {micOn ? <Mic className="w-4 h-4 text-white" /> : <MicOff className="w-4 h-4 text-white" />}
            </button>
            <button onClick={handleToggleCamera} className={`w-8 h-8 rounded-full flex items-center justify-center ${cameraOn ? "bg-white/20" : "bg-[#EF4444]"}`}>
              {cameraOn ? <Video className="w-4 h-4 text-white" /> : <VideoOff className="w-4 h-4 text-white" />}
            </button>
          </div>
        </div>

        {/* Messages */}
        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === "assistant" ? "bg-gradient-to-br from-[#7C3AED] to-[#06B6D4]" : "bg-[#1A1A2E]"}`}>
                {msg.role === "assistant" ? <span className="text-white text-xs font-bold">AI</span> : <User className="w-4 h-4 text-[#94A3B8]" />}
              </div>
              <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${msg.role === "assistant" ? "bg-[#1A1A2E] text-[#F1F5F9]" : "bg-[#7C3AED] text-white"}`}>
                {msg.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* AI typing indicator */}
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

      {/* Input area */}
      <div className="px-4 pb-6 pt-3 glass shrink-0">
        {/* Transcription status */}
        {isTranscribing && (
          <div className="flex items-center gap-2 mb-2 px-1">
            <Loader2 className="w-3 h-3 text-[#7C3AED] animate-spin" />
            <span className="text-xs text-[#7C3AED]">Transcribiendo...</span>
          </div>
        )}
        {isSpeaking && !isTranscribing && (
          <div className="flex items-center gap-2 mb-2 px-1">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
            <span className="text-xs text-[#10B981]">Escuchando...</span>
          </div>
        )}

        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend() } }}
            placeholder="Habla — o escribe tu respuesta..."
            rows={2}
            className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-[#64748B] focus:border-[#7C3AED]/50 focus:outline-none resize-none"
          />
          <button onClick={handleSend} disabled={!input.trim() || loading}
            className="w-10 h-10 self-end rounded-full bg-gradient-to-br from-[#7C3AED] to-[#9F67FF] flex items-center justify-center disabled:opacity-40">
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>
        <button onClick={() => doGenerateReport(messages)}
          className="mt-2 w-full text-xs text-[#475569] hover:text-[#94A3B8] transition-colors">
          Terminar entrevista anticipadamente
        </button>
      </div>
    </div>
  )
}
