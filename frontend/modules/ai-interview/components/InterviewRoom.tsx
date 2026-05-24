"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { Mic, MicOff, Video, PhoneOff, Sparkles, Loader2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useInterviewWebSocket } from "../use-interview-ws"
import { ScoreCards } from "./ScoreCards"

interface InterviewRoomProps {
  sessionId: string
  role?: "candidate" | "recruiter"
}

export function InterviewRoom({ sessionId, role = "candidate" }: InterviewRoomProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [micOn, setMicOn] = useState(true)
  const [answer, setAnswer] = useState("")
  const [status, setStatus] = useState<"live" | "ended">("live")

  const {
    connected,
    scores,
    lastHint,
    lastQuestion,
    error,
    sendTranscript,
    sendVideoFrame,
    requestQuestion,
    endInterview,
  } = useInterviewWebSocket(sessionId)

  useEffect(() => {
    let active = true
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((media) => {
        if (!active) return
        setStream(media)
        if (videoRef.current) videoRef.current.srcObject = media
      })
      .catch(() => setStream(null))
    return () => {
      active = false
      stream?.getTracks().forEach((t) => t.stop())
    }
  }, [])

  useEffect(() => {
    if (!stream || !videoRef.current || !canvasRef.current) return
    const interval = setInterval(() => {
      const video = videoRef.current
      const canvas = canvasRef.current
      if (!video || !canvas || video.readyState < 2) return
      canvas.width = 320
      canvas.height = 180
      const ctx = canvas.getContext("2d")
      if (!ctx) return
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      sendVideoFrame(canvas.toDataURL("image/jpeg", 0.55))
    }, 3000)
    return () => clearInterval(interval)
  }, [stream, sendVideoFrame])

  const handleSubmitAnswer = useCallback(() => {
    if (!answer.trim()) return
    sendTranscript(answer.trim())
    setAnswer("")
  }, [answer, sendTranscript])

  const handleEnd = useCallback(() => {
    endInterview()
    setStatus("ended")
    stream?.getTracks().forEach((t) => t.stop())
  }, [endInterview, stream])

  return (
    <div className="min-h-screen bg-[#0a0614] text-white">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-1/2 top-0 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-[#7C3AED]/15 blur-[120px]" />
      </div>

      <header className="relative z-10 flex items-center justify-between border-b border-white/10 px-4 py-4 sm:px-8">
        <Link href="/" className="font-display text-lg font-semibold">
          HYRE <span className="text-[#7C3AED]">Interview AI</span>
        </Link>
        <div className="flex items-center gap-2 text-xs">
          <span
            className={`h-2 w-2 rounded-full ${connected ? "bg-[#10B981]" : "bg-[#EF4444]"}`}
          />
          {connected ? "En vivo" : "Reconectando…"}
        </div>
      </header>

      <main className="relative z-10 mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-3 lg:px-8">
        <div className="space-y-4 lg:col-span-2">
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-black/40 aspect-video">
            <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover" />
            <canvas ref={canvasRef} className="hidden" />
            {!stream && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-[#94A3B8]">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Activando cámara…
              </div>
            )}
          </div>

          {lastQuestion && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-[#7C3AED]/30 bg-[#7C3AED]/10 p-4"
            >
              <p className="text-xs text-[#C4B5FD]">Pregunta del entrevistador IA</p>
              <p className="mt-1 text-white">{lastQuestion}</p>
            </motion.div>
          )}

          {role === "candidate" && status === "live" && (
            <div className="flex flex-col gap-3 sm:flex-row">
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Escribe tu respuesta (STT en producción)…"
                className="min-h-[80px] flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-[#64748B] focus:border-[#7C3AED]/50 focus:outline-none"
              />
              <div className="flex flex-col gap-2">
                <Button
                  className="rounded-full bg-gradient-to-r from-[#7C3AED] to-[#9F67FF]"
                  onClick={handleSubmitAnswer}
                >
                  Enviar respuesta
                </Button>
                <Button variant="outline" className="rounded-full border-white/15" onClick={requestQuestion}>
                  Siguiente pregunta
                </Button>
              </div>
            </div>
          )}

          {lastHint && (
            <div className="flex items-start gap-2 rounded-xl border border-[#06B6D4]/30 bg-[#06B6D4]/10 p-3 text-sm text-[#A5F3FC]">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0" />
              {lastHint}
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full border-white/15"
              onClick={() => {
                setMicOn((v) => !v)
                stream?.getAudioTracks().forEach((t) => (t.enabled = !micOn))
              }}
            >
              {micOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
            </Button>
            <Button variant="outline" size="icon" className="rounded-full border-white/15">
              <Video className="h-4 w-4" />
            </Button>
            <Button
              variant="destructive"
              className="rounded-full"
              onClick={handleEnd}
              disabled={status === "ended"}
            >
              <PhoneOff className="mr-2 h-4 w-4" />
              Finalizar
            </Button>
          </div>

          {error && <p className="text-sm text-[#F87171]">{error}</p>}
        </div>

        <aside className="space-y-4">
          <h2 className="font-display text-lg font-semibold">Análisis en tiempo real</h2>
          <ScoreCards scores={scores} />
        </aside>
      </main>
    </div>
  )
}
