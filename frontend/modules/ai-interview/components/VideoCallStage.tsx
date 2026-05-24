"use client"

import { RefObject } from "react"
import { motion } from "framer-motion"
import { Circle, Loader2 } from "lucide-react"
import { AIInterviewerAvatar } from "./AIInterviewerAvatar"
import { cn } from "@/lib/utils"

interface VideoCallStageProps {
  videoRef: RefObject<HTMLVideoElement | null>
  stream: MediaStream | null
  mediaError: string | null
  agentName?: string | null
  connected: boolean
  aiThinking: boolean
  aiSpeaking: boolean
  isRecording: boolean
  timerLabel: string
  progressPct: number
  phaseLabel?: string | null
  questionNumber?: number
}

export function VideoCallStage({
  videoRef,
  stream,
  mediaError,
  agentName,
  connected,
  aiThinking,
  aiSpeaking,
  isRecording,
  timerLabel,
  progressPct,
  phaseLabel,
  questionNumber = 1,
}: VideoCallStageProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-black/50 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-sm">
      <div className="absolute inset-0 bg-gradient-to-br from-[#7C3AED]/10 via-transparent to-[#06B6D4]/8" />

      <div className="relative flex flex-col lg:flex-row">
        <div className="relative aspect-video min-h-[220px] flex-1 lg:min-h-[360px]">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="h-full w-full object-cover"
          />
          {!stream && !mediaError && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/70 text-[#94A3B8]">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Activando cámara…
            </div>
          )}
          {mediaError && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80 p-6 text-center text-sm text-[#FCA5A5]">
              {mediaError}
            </div>
          )}

          <div className="absolute left-3 top-3 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/50 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-white backdrop-blur-md">
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  connected ? "bg-[#10B981] animate-pulse" : "bg-[#EF4444]",
                )}
              />
              {connected ? "En vivo" : "Reconectando"}
            </span>
            {isRecording && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#EF4444]/40 bg-[#EF4444]/15 px-2.5 py-1 text-[10px] font-medium text-[#FCA5A5] backdrop-blur-md">
                <Circle className="h-2 w-2 fill-current animate-pulse" />
                REC
              </span>
            )}
            <span className="rounded-full border border-white/15 bg-black/50 px-2.5 py-1 font-mono text-[10px] text-[#94A3B8] backdrop-blur-md">
              {timerLabel}
            </span>
          </div>

          <div className="absolute bottom-3 left-3 right-3">
            <div className="mb-2 flex items-center justify-between text-[10px] text-[#94A3B8]">
              <span>
                {phaseLabel ?? "Entrevista"} · Pregunta {questionNumber}
              </span>
              <span>{Math.round(progressPct)}%</span>
            </div>
            <div className="h-1 overflow-hidden rounded-full bg-white/10">
              <motion.div
                className="h-full bg-gradient-to-r from-[#7C3AED] via-[#9F67FF] to-[#06B6D4]"
                animate={{ width: `${Math.min(100, Math.max(0, progressPct))}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center border-t border-white/10 bg-gradient-to-b from-[#120a24]/90 to-[#0a0614]/95 p-6 lg:w-[220px] lg:border-l lg:border-t-0 xl:w-[260px]">
          <AIInterviewerAvatar
            agentName={agentName}
            connected={connected}
            thinking={aiThinking}
            speaking={aiSpeaking}
            size="lg"
          />
        </div>
      </div>
    </div>
  )
}
