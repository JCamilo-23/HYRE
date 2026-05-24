"use client"

import { useCallback, useEffect, useRef } from "react"

export interface UseAudioCaptureOptions {
  stream: MediaStream | null
  intervalMs?: number
  onChunk: (base64: string) => void
  enabled?: boolean
}

export function useAudioCapture({
  stream,
  intervalMs = 5000,
  onChunk,
  enabled = true,
}: UseAudioCaptureOptions) {
  const recorderRef = useRef<MediaRecorder | null>(null)
  const onChunkRef = useRef(onChunk)
  onChunkRef.current = onChunk

  const sendBlob = useCallback(async (blob: Blob) => {
    const buffer = await blob.arrayBuffer()
    const bytes = new Uint8Array(buffer)
    let binary = ""
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    const b64 = btoa(binary)
    onChunkRef.current(b64)
  }, [])

  useEffect(() => {
    if (!enabled || !stream) return

    const mime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
      ? "audio/webm;codecs=opus"
      : "audio/webm"

    let recorder: MediaRecorder
    try {
      recorder = new MediaRecorder(stream, { mimeType: mime })
    } catch {
      return
    }

    recorder.ondataavailable = (ev) => {
      if (ev.data.size > 0) void sendBlob(ev.data)
    }

    recorder.start(intervalMs)
    recorderRef.current = recorder

    return () => {
      if (recorder.state !== "inactive") recorder.stop()
      recorderRef.current = null
    }
  }, [stream, intervalMs, enabled, sendBlob])
}
