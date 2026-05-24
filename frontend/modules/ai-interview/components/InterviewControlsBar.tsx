"use client"

import { Mic, MicOff, Video, VideoOff, PhoneOff, Radio } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface InterviewControlsBarProps {
  micOn: boolean
  cameraOn: boolean
  sttSupported: boolean
  sttListening: boolean
  connected: boolean
  ended: boolean
  onToggleMic: () => void
  onToggleCamera: () => void
  onToggleStt: () => void
  onEnd: () => void
}

export function InterviewControlsBar({
  micOn,
  cameraOn,
  sttSupported,
  sttListening,
  connected,
  ended,
  onToggleMic,
  onToggleCamera,
  onToggleStt,
  onEnd,
}: InterviewControlsBarProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl">
      <Button
        variant="outline"
        size="icon"
        className={cn(
          "h-12 w-12 rounded-full border-white/15 bg-white/5",
          !micOn && "border-[#EF4444]/40 text-[#FCA5A5]",
        )}
        onClick={onToggleMic}
        disabled={ended}
        aria-label={micOn ? "Silenciar micrófono" : "Activar micrófono"}
      >
        {micOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
      </Button>

      <Button
        variant="outline"
        size="icon"
        className={cn(
          "h-12 w-12 rounded-full border-white/15 bg-white/5",
          !cameraOn && "border-[#EF4444]/40 text-[#FCA5A5]",
        )}
        onClick={onToggleCamera}
        disabled={ended}
        aria-label={cameraOn ? "Apagar cámara" : "Encender cámara"}
      >
        {cameraOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
      </Button>

      {sttSupported && (
        <Button
          variant="outline"
          className={cn(
            "h-12 rounded-full border-white/15 px-5",
            sttListening && "border-[#06B6D4] bg-[#06B6D4]/10 text-[#67E8F9]",
          )}
          onClick={onToggleStt}
          disabled={ended || !connected}
        >
          <Radio className="mr-2 h-4 w-4" />
          {sttListening ? "Escuchando…" : "Voz en vivo"}
        </Button>
      )}

      <Button
        variant="destructive"
        className="h-12 rounded-full px-6 shadow-[0_0_32px_rgba(239,68,68,0.35)]"
        onClick={onEnd}
        disabled={ended}
      >
        <PhoneOff className="mr-2 h-4 w-4" />
        Finalizar
      </Button>
    </div>
  )
}
