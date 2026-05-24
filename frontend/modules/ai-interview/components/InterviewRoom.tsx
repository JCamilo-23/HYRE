"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { Mic, MicOff, Video, PhoneOff, Sparkles, Loader2, Radio } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useInterviewWebSocket } from "../use-interview-ws"
import { useSpeechRecognition } from "../use-speech-recognition"
import { useAudioCapture } from "../use-audio-capture"
import { ScoreCards } from "./ScoreCards"
import { RecruiterInsights } from "./RecruiterInsights"
import { LiveTranscript } from "./LiveTranscript"
import { AIInterviewerPanel } from "./AIInterviewerPanel"
import { LiveFeedbackPanel } from "./LiveFeedbackPanel"
import { InterviewReportPanel } from "./InterviewReportPanel"

interface InterviewRoomProps {
  sessionId: string
  role?: "candidate" | "recruiter"
}

export function InterviewRoom({ sessionId, role = "candidate" }: InterviewRoomProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [micOn, setMicOn] = useState(true)
  const [mediaError, setMediaError] = useState<string | null>(null)
  const [answer, setAnswer] = useState("")
  const [status, setStatus] = useState<"live" | "ended">("live")

  const {
    connected,
    scores,
    lastHint,
    lastQuestion,
    liveFeedback,
    finalReport,
    reportLoading,
    interviewEnded,
    aiThinking,
    phaseLabel,
    progressPct,
    cultureInsights,
    agentDisplayName,
    agentType,
    conversation,
    transcriptLines,
    contentSummary,
    events,
    error,
    sendTranscript,
    sendVideoFrame,
    sendAudioChunk,
    requestQuestion,
    endInterview,
  } = useInterviewWebSocket(sessionId)

  useEffect(() => {
    const stored = sessionStorage.getItem(`hyre_opening_${sessionId}`)
    if (stored && !lastQuestion) {
      // Opening question also arrives via WebSocket; sessionStorage is fallback
      sessionStorage.removeItem(`hyre_opening_${sessionId}`)
    }
  }, [sessionId, lastQuestion])

  const handleFinalTranscript = useCallback(
    (text: string, confidence: number) => {
      sendTranscript(text, confidence)
      setAnswer("")
    },
    [sendTranscript],
  )

  const {
    supported: sttSupported,
    listening: sttListening,
    interim: sttInterim,
    error: sttError,
    toggle: toggleStt,
  } = useSpeechRecognition({
    lang: "es-ES",
    onFinalTranscript: handleFinalTranscript,
    onInterimTranscript: (text) => setAnswer(text),
  })

  const {
    error: audioCaptureError,
    isRecording: audioRecording,
    retry: retryAudioCapture,
  } = useAudioCapture({
    stream: micOn && stream ? stream : null,
    enabled: role === "candidate" && status === "live" && Boolean(stream),
    onChunk: sendAudioChunk,
  })

  useEffect(() => {
    let active = true
    let mediaStream: MediaStream | null = null
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((media) => {
        if (!active) {
          media.getTracks().forEach((t) => t.stop())
          return
        }
        mediaStream = media
        setStream(media)
        if (videoRef.current) {
          videoRef.current.srcObject = media
        }
      })
      .catch((err) => {
        console.error("getUserMedia failed:", err)
        setStream(null)
        const name = err instanceof DOMException ? err.name : ""
        if (name === "NotAllowedError" || name === "PermissionDeniedError") {
          setMediaError(
            "Permiso de cámara o micrófono denegado. Permítelo en el navegador y recarga la página.",
          )
        } else if (name === "NotFoundError") {
          setMediaError("No se encontró cámara o micrófono en este dispositivo.")
        } else {
          setMediaError(
            "No se pudo activar cámara/micrófono. Comprueba permisos y que ninguna otra app los use.",
          )
        }
      })
    return () => {
      active = false
      mediaStream?.getTracks().forEach((t) => t.stop())
    }
  }, [])

  useEffect(() => {
    if (stream && videoRef.current && videoRef.current.srcObject !== stream) {
      videoRef.current.srcObject = stream
    }
  }, [stream])

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

  useEffect(() => {
    if (interviewEnded) setStatus("ended")
  }, [interviewEnded])

  const displayQuestion =
    lastQuestion ||
    (typeof window !== "undefined"
      ? sessionStorage.getItem(`hyre_opening_${sessionId}`)
      : null)

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
          <div className="relative aspect-video overflow-hidden rounded-3xl border border-white/10 bg-black/40">
            <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover" />
            <canvas ref={canvasRef} className="hidden" />
            {!stream && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-[#94A3B8]">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Activando cámara…
              </div>
            )}
          </div>

          <LiveFeedbackPanel feedback={liveFeedback} />

          <AIInterviewerPanel
            agentName={agentDisplayName}
            agentRole={agentType}
            question={displayQuestion}
            connected={connected}
            thinking={aiThinking}
            phaseLabel={phaseLabel}
            progressPct={progressPct}
            conversation={conversation}
          />

          {contentSummary && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-[#CBD5E1]"
            >
              <span className="text-xs text-[#7C3AED]">Análisis Gemini · </span>
              {contentSummary}
            </motion.div>
          )}

          <LiveTranscript lines={transcriptLines} interim={sttListening ? sttInterim : undefined} />

          {role === "candidate" && status === "live" && (
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="flex-1 space-y-2">
                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder={
                    sttSupported
                      ? "Habla o escribe tu respuesta…"
                      : "Escribe tu respuesta (activa micrófono para STT)"
                  }
                  className="min-h-[80px] w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-[#64748B] focus:border-[#7C3AED]/50 focus:outline-none"
                />
              </div>
              <div className="flex flex-col gap-2">
                {sttSupported && (
                  <Button
                    variant="outline"
                    className={`rounded-full border-white/15 ${sttListening ? "border-[#06B6D4] text-[#06B6D4]" : ""}`}
                    onClick={toggleStt}
                  >
                    <Radio className="mr-2 h-4 w-4" />
                    {sttListening ? "Detener voz" : "Hablar (STT)"}
                  </Button>
                )}
                <Button
                  className="rounded-full bg-gradient-to-r from-[#7C3AED] to-[#9F67FF]"
                  onClick={handleSubmitAnswer}
                  disabled={!connected}
                >
                  Enviar respuesta
                </Button>
                <Button
                  variant="outline"
                  className="rounded-full border-white/15"
                  onClick={requestQuestion}
                  disabled={!connected}
                >
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
                setMicOn((prev) => {
                  const next = !prev
                  stream?.getAudioTracks().forEach((track) => {
                    track.enabled = next
                  })
                  return next
                })
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

          {(mediaError || audioCaptureError) && (
            <div className="rounded-xl border border-[#F87171]/30 bg-[#F87171]/10 p-3 text-sm text-[#FCA5A5]">
              <p>{mediaError ?? audioCaptureError}</p>
              {audioCaptureError && !mediaError && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 rounded-full border-white/15"
                  onClick={retryAudioCapture}
                >
                  Reintentar captura de audio
                </Button>
              )}
            </div>
          )}

          {(error || sttError) && (
            <p className="text-sm text-[#F87171]">{error ?? sttError}</p>
          )}

          {audioRecording && micOn && !audioCaptureError && (
            <p className="text-xs text-[#64748B]">Micrófono activo · enviando audio al análisis</p>
          )}
        </div>

        <aside className="space-y-4">
          <h2 className="font-display text-lg font-semibold">
            {role === "recruiter" ? "Panel reclutador" : "Análisis en tiempo real"}
          </h2>
          {role === "recruiter" ? (
            <>
              <RecruiterInsights scores={scores} events={events} sessionId={sessionId} cultureInsights={cultureInsights} personalityProfile={cultureInsights?.personality_profile} agentDisplayName={agentDisplayName} />
              <ScoreCards scores={scores} />
            </>
          ) : (
            <ScoreCards scores={scores} />
          )}
        </aside>
      </main>
      {(status === "ended" || interviewEnded) && (
        <InterviewReportPanel
          sessionId={sessionId}
          scores={scores}
          report={finalReport}
          loading={reportLoading || (interviewEnded && !finalReport)}
        />
      )}
    </div>
  )
}
