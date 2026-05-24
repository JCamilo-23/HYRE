"use client"

import { useCallback, useEffect, useRef, useState } from "react"

const MIME_CANDIDATES = [
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/mp4",
  "audio/ogg;codecs=opus",
]

export interface UseAudioCaptureOptions {
  stream: MediaStream | null
  intervalMs?: number
  onChunk: (base64: string) => void
  enabled?: boolean
}

export interface AudioCaptureState {
  /** User-visible error; does not throw */
  error: string | null
  isRecording: boolean
  mimeType: string | null
  /** Call to re-attempt MediaRecorder after fixing mic/stream */
  retry: () => void
}

function pickSupportedMimeType(): string | undefined {
  if (typeof MediaRecorder === "undefined") return undefined
  for (const mime of MIME_CANDIDATES) {
    if (MediaRecorder.isTypeSupported(mime)) return mime
  }
  return undefined
}

function buildAudioOnlyStream(stream: MediaStream): MediaStream | null {
  const tracks = stream
    .getAudioTracks()
    .filter((t) => t.readyState === "live" && t.enabled)
  if (tracks.length === 0) return null
  return new MediaStream(tracks)
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      const result = reader.result
      if (typeof result !== "string") {
        reject(new Error("FileReader did not return a string"))
        return
      }
      const base64 = result.split(",")[1]
      if (!base64) {
        reject(new Error("Empty audio chunk"))
        return
      }
      resolve(base64)
    }
    reader.onerror = () => reject(reader.error ?? new Error("FileReader failed"))
    reader.readAsDataURL(blob)
  })
}

function createMediaRecorder(audioStream: MediaStream): MediaRecorder {
  const preferred = pickSupportedMimeType()
  if (preferred) {
    try {
      return new MediaRecorder(audioStream, { mimeType: preferred })
    } catch (e) {
      console.warn("[audio-capture] MediaRecorder with mime failed:", preferred, e)
    }
  }
  try {
    return new MediaRecorder(audioStream)
  } catch (e) {
    throw new Error(
      `MediaRecorder no soportado en este navegador: ${e instanceof Error ? e.message : String(e)}`,
    )
  }
}

function safeStartRecorder(
  recorder: MediaRecorder,
  timesliceMs: number,
): "timeslice" | "manual" {
  if (recorder.state !== "inactive") {
    throw new Error(`MediaRecorder already in state "${recorder.state}"`)
  }

  if (timesliceMs > 0) {
    try {
      recorder.start(timesliceMs)
      return "timeslice"
    } catch (e) {
      console.warn("[audio-capture] start(timeslice) failed, falling back:", e)
    }
  }

  recorder.start()
  return "manual"
}

function stopRecorder(recorder: MediaRecorder | null) {
  if (!recorder) return
  if (recorder.state === "recording" || recorder.state === "paused") {
    try {
      recorder.stop()
    } catch (e) {
      console.warn("[audio-capture] stop() failed:", e)
    }
  }
}

export function useAudioCapture({
  stream,
  intervalMs = 5000,
  onChunk,
  enabled = true,
}: UseAudioCaptureOptions): AudioCaptureState {
  const [error, setError] = useState<string | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [mimeType, setMimeType] = useState<string | null>(null)
  const [retryNonce, setRetryNonce] = useState(0)

  const recorderRef = useRef<MediaRecorder | null>(null)
  const manualIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const generationRef = useRef(0)
  const onChunkRef = useRef(onChunk)
  onChunkRef.current = onChunk

  const retry = useCallback(() => {
    setError(null)
    setRetryNonce((n) => n + 1)
  }, [])

  const sendBlob = useCallback(async (blob: Blob) => {
    if (blob.size === 0) return
    try {
      const b64 = await blobToBase64(blob)
      onChunkRef.current(b64)
    } catch (e) {
      console.error("[audio-capture] chunk encode failed:", e)
    }
  }, [])

  useEffect(() => {
    const generation = ++generationRef.current

    const cleanup = () => {
      if (manualIntervalRef.current) {
        clearInterval(manualIntervalRef.current)
        manualIntervalRef.current = null
      }
      stopRecorder(recorderRef.current)
      recorderRef.current = null
      setIsRecording(false)
    }

    if (!enabled || !stream) {
      cleanup()
      return cleanup
    }

    if (typeof MediaRecorder === "undefined") {
      setError("MediaRecorder no está disponible en este navegador.")
      return cleanup
    }

    const audioStream = buildAudioOnlyStream(stream)
    if (!audioStream) {
      setError("No hay pista de audio activa. Activa el micrófono e inténtalo de nuevo.")
      return cleanup
    }

    let recorder: MediaRecorder
    try {
      recorder = createMediaRecorder(audioStream)
    } catch (e) {
      const msg = e instanceof Error ? e.message : "No se pudo crear MediaRecorder"
      console.error("[audio-capture] create failed:", e)
      setError(msg)
      return cleanup
    }

    recorder.ondataavailable = (ev) => {
      if (ev.data.size > 0) void sendBlob(ev.data)
    }

    recorder.onerror = (ev) => {
      console.error("[audio-capture] recorder error:", ev)
      setError("Error en la grabación de audio.")
      cleanup()
    }

    recorder.onstop = () => {
      setIsRecording(false)
    }

    let startMode: "timeslice" | "manual"
    try {
      startMode = safeStartRecorder(recorder, intervalMs)
    } catch (e) {
      const msg =
        e instanceof Error
          ? e.message
          : "No se pudo iniciar MediaRecorder (comprueba permisos del micrófono)"
      console.error("[audio-capture] start failed:", {
        message: msg,
        mime: recorder.mimeType,
        state: recorder.state,
        audioTracks: audioStream.getAudioTracks().map((t) => ({
          label: t.label,
          enabled: t.enabled,
          readyState: t.readyState,
        })),
      })
      setError(msg)
      cleanup()
      return cleanup
    }

    if (generation !== generationRef.current) {
      stopRecorder(recorder)
      return cleanup
    }

    recorderRef.current = recorder
    setMimeType(recorder.mimeType || null)
    setIsRecording(true)
    setError(null)

    if (startMode === "manual") {
      manualIntervalRef.current = setInterval(() => {
        if (recorderRef.current?.state === "recording") {
          try {
            recorderRef.current.requestData()
          } catch (e) {
            console.warn("[audio-capture] requestData failed:", e)
          }
        }
      }, intervalMs)
    }

    console.info("[audio-capture] started", {
      mime: recorder.mimeType,
      mode: startMode,
      intervalMs,
    })

    return () => {
      generationRef.current++
      cleanup()
    }
  }, [stream, intervalMs, enabled, sendBlob, retryNonce])

  return { error, isRecording, mimeType, retry }
}
