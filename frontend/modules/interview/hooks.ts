"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import {
  createInterviewSession,
  evaluateInterviewAnswer,
  fetchInterviewQuestion,
  interviewStreamUrl,
} from "./api"
import { useSpeechRecognition } from "./use-speech-recognition"
import type {
  InterviewAnswerEvaluation,
  InterviewLiveScores,
  InterviewQuestion,
  InterviewStreamEvent,
} from "./types"
import type { CreateWorkSimulatorSessionInput } from "@/modules/work-simulator/types"
import { MATCH_COMPANIES } from "@/lib/match-companies"
import { useLikedCompaniesStore } from "@/store/liked-companies-store"

export interface UseRealtimeInterviewOptions {
  candidateName?: string
  sessionInput?: CreateWorkSimulatorSessionInput
}

export function useRealtimeInterview(options: UseRealtimeInterviewOptions = {}) {
  const liked = useLikedCompaniesStore((s) => s.likedCompanies)
  const company = liked[0] ?? MATCH_COMPANIES[0]

  const [sessionId, setSessionId] = useState<string | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState<InterviewQuestion | null>(null)
  const [progress, setProgress] = useState({ current: 0, total: 6 })
  const [scores, setScores] = useState<InterviewLiveScores | null>(null)
  const [lastEvaluation, setLastEvaluation] = useState<InterviewAnswerEvaluation | null>(null)
  const [analysisFeedback, setAnalysisFeedback] = useState<string | null>(null)
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLive, setIsLive] = useState(false)
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null)

  const eventSourceRef = useRef<EventSource | null>(null)

  const speech = useSpeechRecognition(isLive && !isAnalyzing && !isLoadingQuestion)

  const defaultInput: CreateWorkSimulatorSessionInput = {
    role_title: company.vacancy,
    company_name: company.name,
    industry: company.industry,
    job_description: company.description,
    culture: company.culture,
    benefits: company.benefits,
    job_id: String(company.id),
  }

  const connectStream = useCallback((id: string) => {
    eventSourceRef.current?.close()
    const es = new EventSource(interviewStreamUrl(id))
    es.onmessage = (msg) => {
      try {
        const event = JSON.parse(msg.data) as InterviewStreamEvent
        if (event.type === "analysis") {
          setLastEvaluation(event.evaluation)
          setScores(event.scores)
          setAnalysisFeedback(event.evaluation.feedback)
          setIsAnalyzing(false)
        }
        if (event.type === "analysis_started") {
          setIsAnalyzing(true)
          setAnalysisFeedback("Analizando con Gemini Pro...")
        }
        if (event.type === "question") {
          setCurrentQuestion(event.question as InterviewQuestion)
          setProgress(event.progress)
          setIsLoadingQuestion(false)
        }
      } catch {
        /* ignore parse errors */
      }
    }
    eventSourceRef.current = es
  }, [])

  const startSession = useCallback(async () => {
    setError(null)
    try {
      const input = { ...defaultInput, ...options.sessionInput }
      const session = await createInterviewSession(input)
      setSessionId(session.id)
      connectStream(session.id)

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        })
        setMediaStream(stream)
      } catch {
        setError("No se pudo acceder a cámara o micrófono")
      }

      setIsLive(true)
      return session.id
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al iniciar")
      return null
    }
  }, [connectStream, defaultInput, options.sessionInput])

  const loadNextQuestion = useCallback(
    async (lastTranscript?: string) => {
      if (!sessionId) return
      setIsLoadingQuestion(true)
      setError(null)
      setLastEvaluation(null)
      setAnalysisFeedback(null)
      speech.resetTranscript()

      try {
        const res = await fetchInterviewQuestion(sessionId, {
          last_transcript: lastTranscript,
        })
        setCurrentQuestion(res.question)
        setProgress(res.progress)
        setScores(res.session.scenario_context.interview_scores ?? null)
      } catch (e) {
        setError(e instanceof Error ? e.message : "No se pudo cargar la pregunta")
      } finally {
        setIsLoadingQuestion(false)
      }
    },
    [sessionId, speech],
  )

  const submitAnswer = useCallback(async () => {
    if (!sessionId) return false
    const text = speech.getFullTranscript()
    if (!text) {
      setError("No se detectó respuesta — habla o escribe en el transcript")
      return false
    }

    setIsAnalyzing(true)
    setError(null)
    try {
      const res = await evaluateInterviewAnswer(sessionId, text)
      setLastEvaluation(res.evaluation)
      setScores(res.scores)
      setAnalysisFeedback(res.evaluation.feedback)
      return true
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al evaluar")
      return false
    } finally {
      setIsAnalyzing(false)
    }
  }, [sessionId, speech])

  const endSession = useCallback(() => {
    setIsLive(false)
    eventSourceRef.current?.close()
    mediaStream?.getTracks().forEach((t) => t.stop())
    setMediaStream(null)
  }, [mediaStream])

  useEffect(() => {
    return () => {
      eventSourceRef.current?.close()
      mediaStream?.getTracks().forEach((t) => t.stop())
    }
  }, [mediaStream])

  const metrics = scores
    ? [
        {
          id: "communication",
          label: "Comunicación",
          value: `${scores.communication}%`,
          color: "#06B6D4",
        },
        {
          id: "confidence",
          label: "Confianza",
          value: `${scores.confidence}%`,
          color: "#7C3AED",
        },
        {
          id: "relevance",
          label: "Relevancia",
          value: `${scores.relevance}%`,
          color: "#10B981",
        },
        {
          id: "overall",
          label: "Score global",
          value: `${scores.overall}%`,
          color: "#F59E0B",
        },
      ]
    : []

  return {
    company,
    candidateName: options.candidateName ?? "Candidato",
    sessionId,
    currentQuestion,
    progress,
    scores,
    lastEvaluation,
    analysisFeedback,
    isLoadingQuestion,
    isAnalyzing,
    error,
    isLive,
    mediaStream,
    speech,
    metrics,
    startSession,
    loadNextQuestion,
    submitAnswer,
    endSession,
  }
}
