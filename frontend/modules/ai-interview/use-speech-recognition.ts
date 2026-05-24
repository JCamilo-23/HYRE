"use client"

import { useCallback, useEffect, useRef, useState } from "react"

type SpeechRecognitionCtor = new () => SpeechRecognition

function getSpeechRecognition(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null
  const w = window as Window & {
    SpeechRecognition?: SpeechRecognitionCtor
    webkitSpeechRecognition?: SpeechRecognitionCtor
  }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}

export interface UseSpeechRecognitionOptions {
  lang?: string
  continuous?: boolean
  onFinalTranscript?: (text: string, confidence: number) => void
  onInterimTranscript?: (text: string) => void
}

export function useSpeechRecognition({
  lang = "es-ES",
  continuous = true,
  onFinalTranscript,
  onInterimTranscript,
}: UseSpeechRecognitionOptions = {}) {
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const [supported, setSupported] = useState(false)
  const [listening, setListening] = useState(false)
  const [interim, setInterim] = useState("")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const Ctor = getSpeechRecognition()
    setSupported(Boolean(Ctor))
    if (!Ctor) return

    const recognition = new Ctor()
    recognition.lang = lang
    recognition.continuous = continuous
    recognition.interimResults = true
    recognition.maxAlternatives = 1

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimText = ""
      let finalText = ""
      let confidence = 1

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        const transcript = result[0]?.transcript ?? ""
        if (result.isFinal) {
          finalText += transcript
          confidence = result[0]?.confidence ?? 1
        } else {
          interimText += transcript
        }
      }

      if (interimText) {
        setInterim(interimText)
        onInterimTranscript?.(interimText)
      }

      if (finalText.trim()) {
        setInterim("")
        onFinalTranscript?.(finalText.trim(), confidence)
      }
    }

    recognition.onerror = (ev: SpeechRecognitionErrorEvent) => {
      setError(ev.error)
      setListening(false)
    }

    recognition.onend = () => {
      setListening(false)
    }

    recognitionRef.current = recognition
    return () => {
      recognition.stop()
      recognitionRef.current = null
    }
  }, [lang, continuous, onFinalTranscript, onInterimTranscript])

  const start = useCallback(() => {
    setError(null)
    try {
      recognitionRef.current?.start()
      setListening(true)
    } catch {
      setError("No se pudo iniciar el reconocimiento de voz")
    }
  }, [])

  const stop = useCallback(() => {
    recognitionRef.current?.stop()
    setListening(false)
  }, [])

  const toggle = useCallback(() => {
    if (listening) stop()
    else start()
  }, [listening, start, stop])

  return {
    supported,
    listening,
    interim,
    error,
    start,
    stop,
    toggle,
  }
}
