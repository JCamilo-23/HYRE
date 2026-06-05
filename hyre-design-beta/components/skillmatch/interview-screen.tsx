"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Video, VideoOff, Mic, MicOff, Camera, Sun, Wifi, Headphones,
  CheckCircle, AlertCircle, ArrowLeft, Loader2, User, Sparkles,
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

const MOCK_REPORT: Report = {
  score: 84,
  hire_probability: 72,
  dimensions: {
    comunicacion: 88,
    tecnico: 80,
    cultura: 86,
    liderazgo: 75,
  },
  strengths: [
    "Comunicacion clara y estructurada",
    "Buen manejo de ejemplos concretos",
    "Actitud proactiva ante retos",
  ],
  improvements: [
    "Profundizar en metricas de impacto",
    "Preparar mas preguntas para el entrevistador",
  ],
  summary:
    "Desempeno solido en la entrevista demo. Demuestras potencial para roles junior con buena base tecnica.",
  recommendation: "CONSIDERAR",
}

export function InterviewScreen({ onNavigate }: InterviewScreenProps) {
  const [stage, setStage] = useState<Stage>("prep")
  const [accepted, setAccepted] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [report, setReport] = useState<Report | null>(null)
  const [timer, setTimer] = useState(0)
  const [micOn, setMicOn] = useState(true)
  const [cameraOn, setCameraOn] = useState(true)
  const [mediaError, setMediaError] = useState<string | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<"connecting" | "connected" | "error">("connecting")
  const [userSpeaking, setUserSpeaking] = useState(false)
  const [aiSpeaking, setAiSpeaking] = useState(false)
  const [liveTranscript, setLiveTranscript] = useState("")
  const [aiStreamText, setAiStreamText] = useState("")
  const [waveform, setWaveform] = useState<number[]>(Array(16).fill(0))

  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const messagesRef = useRef<Message[]>([])
  const bottomRef = useRef<HTMLDivElement>(null)
  const pcRef = useRef<RTCPeerConnection | null>(null)
  const dcRef = useRef<RTCDataChannel | null>(null)
  const audioElRef = useRef<HTMLAudioElement | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animFrameRef = useRef<number>(0)

  useEffect(() => { messagesRef.current = messages }, [messages])

  useEffect(() => {
    if (stage !== "live") return
    const id = setInterval(() => setTimer(t => t + 1), 1000)
    return () => clearInterval(id)
  }, [stage])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, aiStreamText])

  // doGenerateReport — defined first; referenced by handleRealtimeEvent
  const doGenerateReport = useCallback(async (_history: Message[]) => {
    cancelAnimationFrame(animFrameRef.current)
    pcRef.current?.close()
    pcRef.current = null
    dcRef.current = null
    audioElRef.current = null
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    setStage("processing")
    await new Promise((r) => setTimeout(r, 1500))
    setReport(MOCK_REPORT)
    setStage("report")
  }, [])

  // handleRealtimeEvent — defined before connectRealtime
  const handleRealtimeEvent = useCallback((ev: Record<string, unknown>) => {
    switch (ev.type) {
      case "input_audio_buffer.speech_started":
        setUserSpeaking(true)
        break
      case "input_audio_buffer.speech_stopped":
        setUserSpeaking(false)
        break
      case "conversation.item.input_audio_transcription.delta":
        setLiveTranscript(p => p + ((ev.delta as string) ?? ""))
        break
      case "conversation.item.input_audio_transcription.completed": {
        const t = ev.transcript as string
        setLiveTranscript("")
        if (t?.trim()) {
          const updated = [...messagesRef.current, { role: "user" as const, content: t }]
          setMessages(updated)
          messagesRef.current = updated
        }
        break
      }
      case "response.audio_transcript.delta":
        setAiSpeaking(true)
        setAiStreamText(p => p + ((ev.delta as string) ?? ""))
        break
      case "response.audio_transcript.done": {
        const t = ev.transcript as string
        setAiStreamText("")
        setAiSpeaking(false)
        if (t?.trim()) {
          const updated = [...messagesRef.current, { role: "assistant" as const, content: t }]
          setMessages(updated)
          messagesRef.current = updated
          const aiCount = updated.filter(m => m.role === "assistant").length
          if (aiCount >= 8 || t.includes("FINALIZAR")) {
            setTimeout(() => doGenerateReport(updated), 1200)
          }
        }
        break
      }
    }
  }, [doGenerateReport])

  // connectRealtime — defined before camera useEffect
  const connectRealtime = useCallback(async (mediaStream: MediaStream) => {
    setConnectionStatus("connecting")
    try {
      const actx = new AudioContext()
      const source = actx.createMediaStreamSource(mediaStream)
      const analyser = actx.createAnalyser()
      analyser.fftSize = 64
      source.connect(analyser)
      analyserRef.current = analyser

      await new Promise((r) => setTimeout(r, 800))
      setConnectionStatus("connected")

      const demoMessages: Message[] = [
        {
          role: "assistant",
          content: `Hola, soy Alex. Hoy practicamos para ${JOB_CONTEXT}. Cuentame un proyecto del que te sientas orgulloso.`,
        },
      ]
      setMessages(demoMessages)
      messagesRef.current = demoMessages

      setTimeout(() => {
        const followUp = [
          ...messagesRef.current,
          {
            role: "user" as const,
            content: "Desarrolle una app de empleabilidad con React y Next.js para mi universidad.",
          },
          {
            role: "assistant" as const,
            content: "Excelente. Que desafio tecnico fue el mas dificil y como lo resolviste?",
          },
        ]
        setMessages(followUp)
        messagesRef.current = followUp
      }, 3500)

      setTimeout(() => doGenerateReport(messagesRef.current), 7000)
    } catch (err) {
      console.error("demo connect:", err)
      setConnectionStatus("error")
    }
  }, [doGenerateReport])

  // Camera + realtime setup
  useEffect(() => {
    if (stage !== "live") return
    let active = true
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(async media => {
        if (!active) { media.getTracks().forEach(t => t.stop()); return }
        streamRef.current = media
        if (videoRef.current) videoRef.current.srcObject = media
        await connectRealtime(media)
      })
      .catch(err => {
        const name = err instanceof DOMException ? err.name : ""
        setMediaError(
          name === "NotAllowedError" || name === "PermissionDeniedError"
            ? "Permiso de cámara/micrófono denegado."
            : "No se encontró cámara o micrófono."
        )
      })
    return () => {
      active = false
      streamRef.current?.getTracks().forEach(t => t.stop())
      streamRef.current = null
      pcRef.current?.close()
      pcRef.current = null
      cancelAnimationFrame(animFrameRef.current)
    }
  }, [stage, connectRealtime])

  useEffect(() => {
    if (cameraOn && streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current
    }
  }, [cameraOn])

  // Waveform animation loop
  useEffect(() => {
    if (connectionStatus !== "connected" || !analyserRef.current) return
    const analyser = analyserRef.current
    const data = new Uint8Array(analyser.frequencyBinCount)
    function tick() {
      analyser.getByteFrequencyData(data)
      setWaveform(
        Array.from({ length: 16 }, (_, i) =>
          (data[Math.floor((i / 16) * data.length)] ?? 0) / 255
        )
      )
      animFrameRef.current = requestAnimationFrame(tick)
    }
    animFrameRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(animFrameRef.current)
  }, [connectionStatus])

  const handleToggleMic = useCallback(() => {
    setMicOn(prev => {
      streamRef.current?.getAudioTracks().forEach(t => { t.enabled = !prev })
      return !prev
    })
  }, [])

  const handleToggleCamera = useCallback(() => {
    setCameraOn(prev => {
      const next = !prev
      streamRef.current?.getVideoTracks().forEach(t => { t.enabled = next })
      return next
    })
  }, [])

  const handleStart = () => {
    setLoading(true)
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
        <p className="text-[#94A3B8] text-sm mb-8">Practica con Alex, tu entrevistador IA en tiempo real</p>

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
            <div className="flex justify-between"><span className="text-[#94A3B8]">Preguntas</span><span className="text-[#F1F5F9]">7-8 dinámicas</span></div>
            <div className="flex justify-between"><span className="text-[#94A3B8]">Powered by</span><span className="text-[#7C3AED] font-medium">OpenAI Realtime</span></div>
          </div>
        </div>

        <div className="glass rounded-2xl p-4 mb-auto">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-[#F59E0B] flex-shrink-0 mt-0.5" />
            <p className="text-[#94A3B8] text-xs leading-relaxed">Entrevista de voz en tiempo real con IA. Habla naturalmente y Alex te escuchará y responderá al instante.</p>
          </div>
        </div>

        <label className="flex items-start gap-3 my-4 cursor-pointer">
          <input type="checkbox" checked={accepted} onChange={e => setAccepted(e.target.checked)}
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
          <p className="text-[#94A3B8]">Analizando tus respuestas con IA...</p>
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
            <Button onClick={() => { setStage("prep"); setMessages([]); setTimer(0); setReport(null); setConnectionStatus("connecting") }}
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
          {connectionStatus === "connected" ? (
            <>
              <div className="w-2 h-2 rounded-full bg-[#10B981]" />
              <span className="text-[#10B981] text-xs font-medium">En vivo</span>
            </>
          ) : connectionStatus === "connecting" ? (
            <>
              <Loader2 className="w-3 h-3 text-[#94A3B8] animate-spin" />
              <span className="text-[#94A3B8] text-xs">Conectando...</span>
            </>
          ) : (
            <>
              <div className="w-2 h-2 rounded-full bg-[#EF4444]" />
              <span className="text-[#EF4444] text-xs">Error de conexión</span>
            </>
          )}
        </div>
        <span className="text-[#F1F5F9] font-mono text-sm">{formatTime(timer)}</span>
        <span className="text-[#94A3B8] text-xs">{messages.filter(m => m.role === "assistant").length} / 8</span>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* Camera */}
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

          {/* AI speaking ring */}
          {aiSpeaking && (
            <div className="absolute inset-0 rounded-2xl ring-2 ring-[#7C3AED]/60 pointer-events-none" />
          )}

          {/* AI label */}
          <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-black/60 rounded-full px-3 py-1.5">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${aiSpeaking ? "bg-gradient-to-br from-[#7C3AED] to-[#9F67FF] animate-pulse" : "bg-gradient-to-br from-[#7C3AED] to-[#06B6D4]"}`}>
              <span className="text-white text-[10px] font-bold">AI</span>
            </div>
            <span className="text-white text-xs">
              {aiSpeaking ? "Alex está hablando..." : "Alex — Entrevistador IA"}
            </span>
          </div>

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

        {/* Chat messages */}
        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
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

        {/* AI streaming bubble */}
        <AnimatePresence>
          {aiStreamText && (
            <motion.div key="ai-stream" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#9F67FF] flex items-center justify-center shrink-0 animate-pulse">
                <span className="text-white text-xs font-bold">AI</span>
              </div>
              <div className="max-w-[80%] bg-[#1A1A2E] px-4 py-3 rounded-2xl text-sm text-[#F1F5F9] leading-relaxed">
                {aiStreamText}<span className="animate-pulse text-[#7C3AED]">▋</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={bottomRef} />
      </div>

      {/* Bottom — waveform + status */}
      <div className="px-4 pb-6 pt-4 glass shrink-0">
        {/* Waveform bars */}
        <div className="flex items-end justify-center gap-1 h-10 mb-3">
          {waveform.map((v, i) => (
            <motion.div
              key={i}
              animate={{ height: `${Math.max(4, v * 40)}px` }}
              transition={{ duration: 0.075 }}
              className={`w-1.5 rounded-full ${
                userSpeaking
                  ? "bg-[#7C3AED]"
                  : connectionStatus === "connected"
                  ? "bg-white/25"
                  : "bg-white/10"
              }`}
            />
          ))}
        </div>

        {/* Status text */}
        <div className="text-center min-h-[20px] mb-2">
          {userSpeaking ? (
            <p className="text-xs text-[#7C3AED] animate-pulse">Escuchando...</p>
          ) : liveTranscript ? (
            <p className="text-xs text-[#94A3B8] truncate px-4">{liveTranscript}</p>
          ) : connectionStatus === "connected" && !aiSpeaking ? (
            <p className="text-xs text-[#475569]">Habla cuando estés listo...</p>
          ) : null}
        </div>

        <button
          onClick={() => doGenerateReport(messages)}
          className="w-full text-xs text-[#475569] hover:text-[#94A3B8] transition-colors py-1"
        >
          Terminar entrevista anticipadamente
        </button>
      </div>
    </div>
  )
}
