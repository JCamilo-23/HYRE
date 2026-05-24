"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useInterviewWebSocket } from "../use-interview-ws"
import { useSpeechRecognition } from "../use-speech-recognition"
import { useAudioCapture } from "../use-audio-capture"
import { useInterviewTimer } from "../hooks/use-interview-timer"
import { RecruiterInsights } from "./RecruiterInsights"
import { LiveTranscript } from "./LiveTranscript"
import { AIInterviewerPanel } from "./AIInterviewerPanel"
import { LiveFeedbackPanel } from "./LiveFeedbackPanel"
import { InterviewReportPanel } from "./InterviewReportPanel"
import { VideoCallStage } from "./VideoCallStage"
import { InterviewControlsBar } from "./InterviewControlsBar"
import { InterviewAnalyticsPanel } from "./InterviewAnalyticsPanel"

interface InterviewRoomProps {
  sessionId: string
  role?: "candidate" | "recruiter"
}

export function InterviewRoom({ sessionId, role = "candidate" }: InterviewRoomProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [micOn, setMicOn] = useState(true)
  const [cameraOn, setCameraOn] = useState(true)
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
    aiSpeaking,
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

  const { formatted: timerLabel } = useInterviewTimer(status === "live" && connected)

  const questionNumber = useMemo(
    () => conversation.filter((e) => e.role === "interviewer").length || 1,
    [conversation],
  )

  useEffect(() => {
    const stored = sessionStorage.getItem(`hyre_opening_${sessionId}`)
    if (stored && !lastQuestion) {
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
    if (!stream || !videoRef.current || !canvasRef.current || !cameraOn) return
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
  }, [stream, sendVideoFrame, cameraOn])

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

  const handleToggleMic = useCallback(() => {
    setMicOn((prev) => {
      const next = !prev
      stream?.getAudioTracks().forEach((track) => {
        track.enabled = next
      })
      return next
    })
  }, [stream])

  const handleToggleCamera = useCallback(() => {
    setCameraOn((prev) => {
      const next = !prev
      stream?.getVideoTracks().forEach((track) => {
        track.enabled = next
      })
      return next
    })
  }, [stream])

  useEffect(() => {
    if (interviewEnded) setStatus("ended")
  }, [interviewEnded])

  const displayQuestion =
    lastQuestion ||
    (typeof window !== "undefined"
      ? sessionStorage.getItem(`hyre_opening_${sessionId}`)
      : null)

  const isRecording = status === "live" && connected && (audioRecording || Boolean(stream))

  return (
    <motion.div className="min-h-screen bg-[#0a0614] text-white">
      <motion.div className="pointer-events-none fixed inset-0">
        <div className="absolute left-1/2 top-0 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-[#7C3AED]/15 blur-[120px]" />
        <motion.div className="absolute bottom-0 right-0 h-[300px] w-[300px] rounded-full bg-[#06B6D4]/10 blur-[100px]" />
      </motion.div>

      <header className="relative z-10 flex items-center justify-between border-b border-white/10 px-4 py-4 sm:px-8">
        <Link href="/interview" className="font-display text-lg font-semibold">
          HYRE <span className="text-[#7C3AED]">Interview AI</span>
        </Link>
        <div className="flex items-center gap-3 text-xs text-[#94A3B8]">
          <span className="hidden sm:inline">{phaseLabel ?? "Entrevista en curso"}</span>
          <span className="font-mono">{timerLabel}</span>
        </div>
      </header>

      <main className="relative z-10 mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-3 lg:px-8">
        <div className="space-y-4 lg:col-span-2">
          <VideoCallStage
            videoRef={videoRef}
            stream={stream}
            mediaError={mediaError}
            agentName={agentDisplayName}
            connected={connected}
            aiThinking={aiThinking}
            aiSpeaking={aiSpeaking}
            isRecording={isRecording}
            timerLabel={timerLabel}
            progressPct={progressPct}
            phaseLabel={phaseLabel}
            questionNumber={questionNumber}
          />
          <canvas ref={canvasRef} className="hidden" aria-hidden />

          <LiveFeedbackPanel feedback={liveFeedback} />

          <AIInterviewerPanel
            agentName={agentDisplayName}
            agentRole={agentType}
            question={displayQuestion}
            connected={connected}
            thinking={aiThinking}
            speaking={aiSpeaking}
            phaseLabel={phaseLabel}
            progressPct={progressPct}
            conversation={conversation}
          />

          {contentSummary && (
            <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-[#CBD5E1]">
              <span className="text-xs text-[#7C3AED]">Análisis Gemini · </span>
              {contentSummary}
            </div>
          )}

          <LiveTranscript lines={transcriptLines} interim={sttListening ? sttInterim : undefined} />

          {role === "candidate" && status === "live" && (
            <motion.div className="flex flex-col gap-3 sm:flex-row">
              <div className="flex-1 space-y-2">
                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      handleSubmitAnswer()
                    }
                  }}
                  placeholder={
                    sttSupported
                      ? "Habla o escribe tu respuesta…"
                      : "Escribe tu respuesta (activa micrófono para STT)"
                  }
                  className="min-h-[80px] w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-[#64748B] focus:border-[#7C3AED]/50 focus:outline-none"
                />
              </div>
              <div className="flex flex-col gap-2 sm:w-44">
                <Button
                  className="rounded-full bg-gradient-to-r from-[#7C3AED] to-[#9F67FF]"
                  onClick={handleSubmitAnswer}
                  disabled={!connected || !answer.trim()}
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
            </motion.div>
          )}

          {lastHint && (
            <div className="flex items-start gap-2 rounded-xl border border-[#06B6D4]/30 bg-[#06B6D4]/10 p-3 text-sm text-[#A5F3FC]">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0" />
              {lastHint}
            </div>
          )}

          <InterviewControlsBar
            micOn={micOn}
            cameraOn={cameraOn}
            sttSupported={sttSupported}
            sttListening={sttListening}
            connected={connected}
            ended={status === "ended"}
            onToggleMic={handleToggleMic}
            onToggleCamera={handleToggleCamera}
            onToggleStt={toggleStt}
            onEnd={handleEnd}
          />

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
            <p className="text-xs text-[#64748B]">Micrófono activo · streaming de audio al análisis</p>
          )}
        </div>

        <aside className="space-y-4">
          <InterviewAnalyticsPanel scores={scores} liveFeedback={liveFeedback} role={role} />
          {role === "recruiter" && (
            <RecruiterInsights
              scores={scores}
              events={events}
              sessionId={sessionId}
              cultureInsights={cultureInsights}
              personalityProfile={cultureInsights?.personality_profile}
              agentDisplayName={agentDisplayName}
            />
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
    </motion.div>
  )
}
