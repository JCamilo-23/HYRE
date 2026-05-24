"use client"

import { useCallback, useEffect, useRef, useState } from "react"

interface SpeechRecognitionResult {
  readonly isFinal: boolean
  readonly 0: { readonly transcript: string }
}

interface SpeechRecognitionEvent {
  readonly results: SpeechRecognitionResult[]
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  onresult: ((ev: SpeechRecognitionEvent) => void) | null
  onerror: ((ev: Event) => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
  abort: () => void
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionInstance
    webkitSpeechRecognition?: new () => SpeechRecognitionInstance
  }
}

export function useSpeechRecognition(enabled: boolean) {
  const [transcript, setTranscript] = useState("")
  const [interimTranscript, setInterimTranscript] = useState("")
  const [isListening, setIsListening] = useState(false)
  const [supported, setSupported] = useState(false)
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null)

  useEffect(() => {
    const SR = window.SpeechRecognition ?? window.webkitSpeechRecognition
    setSupported(!!SR)
    if (!SR) return

    const recognition = new SR()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = "es-CO"

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = ""
      let final = ""
      for (let i = 0; i < event.results.length; i++) {
        const part = event.results[i][0]?.transcript ?? ""
        if (event.results[i].isFinal) final += part
        else interim += part
      }
      if (final) setTranscript((prev) => `${prev} ${final}`.trim())
      setInterimTranscript(interim)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognitionRef.current = recognition
    return () => {
      recognition.abort()
    }
  }, [])

  useEffect(() => {
    const recognition = recognitionRef.current
    if (!recognition || !supported) return

    if (enabled && !isListening) {
      try {
        recognition.start()
        setIsListening(true)
      } catch {
        /* already started */
      }
    } else if (!enabled && isListening) {
      recognition.stop()
      setIsListening(false)
    }
  }, [enabled, supported, isListening])

  const resetTranscript = useCallback(() => {
    setTranscript("")
    setInterimTranscript("")
  }, [])

  const setManualTranscript = useCallback((text: string) => {
    setTranscript(text)
    setInterimTranscript("")
  }, [])

  const getFullTranscript = useCallback(() => {
    return `${transcript} ${interimTranscript}`.trim()
  }, [transcript, interimTranscript])

  return {
    transcript,
    interimTranscript,
    displayTranscript: getFullTranscript(),
    isListening,
    supported,
    resetTranscript,
    setManualTranscript,
    getFullTranscript,
  }
}
