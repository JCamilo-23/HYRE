"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import type {
  ConversationEntry,
  InterviewPhaseId,
  InterviewReport,
  InterviewScores,
  InterviewWsEvent,
  LiveFeedback,
} from "./types"
import { getInterviewReport } from "./api"
import { getInterviewWsUrl } from "./api"

export function useInterviewWebSocket(sessionId: string | null) {
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectAttempt = useRef(0)
  const [connected, setConnected] = useState(false)
  const [scores, setScores] = useState<InterviewScores | null>(null)
  const [lastHint, setLastHint] = useState<string | null>(null)
  const [lastQuestion, setLastQuestion] = useState<string | null>(null)
  const [lastInterviewerMessage, setLastInterviewerMessage] = useState<string | null>(null)
  const [liveFeedback, setLiveFeedback] = useState<LiveFeedback | null>(null)
  const [finalReport, setFinalReport] = useState<InterviewReport | null>(null)
  const [reportLoading, setReportLoading] = useState(false)
  const [interviewEnded, setInterviewEnded] = useState(false)
  const [aiThinking, setAiThinking] = useState(false)
  const [phase, setPhase] = useState<InterviewPhaseId | null>(null)
  const [phaseLabel, setPhaseLabel] = useState<string | null>(null)
  const [progressPct, setProgressPct] = useState(0)
  const [difficulty, setDifficulty] = useState<string | null>(null)
  const [conversation, setConversation] = useState<ConversationEntry[]>([])
  const [transcriptLines, setTranscriptLines] = useState<string[]>([])
  const [contentSummary, setContentSummary] = useState<string | null>(null)
  const [events, setEvents] = useState<InterviewWsEvent[]>([])
  const [error, setError] = useState<string | null>(null)

  const appendConversation = useCallback((entry: ConversationEntry) => {
    setConversation((prev) => [...prev.slice(-24), entry])
  }, [])

  const applyScores = useCallback((next: InterviewScores) => {
    setScores(next)
  }, [])

  const loadReport = useCallback(async (sid: string) => {
    setReportLoading(true)
    try {
      const data = await getInterviewReport(sid)
      setFinalReport(data.report)
      if (data.final_score) applyScores(data.final_score)
    } catch {
      /* report may arrive via WS */
    } finally {
      setReportLoading(false)
    }
  }, [applyScores])

  const connect = useCallback(() => {
    if (!sessionId) return
    if (wsRef.current?.readyState === WebSocket.OPEN) return

    const ws = new WebSocket(getInterviewWsUrl(sessionId))
    wsRef.current = ws

    ws.onopen = () => {
      setConnected(true)
      setError(null)
      reconnectAttempt.current = 0
    }

    ws.onmessage = (ev) => {
      try {
        const data = JSON.parse(ev.data) as InterviewWsEvent & {
          content?: { summary?: string }
          message?: string
          question?: string
          thinking?: boolean
          feedback?: LiveFeedback
          final_report?: InterviewReport
        }
        setEvents((prev) => [...prev.slice(-50), data])

        const scorePayload =
          ("scores" in data && data.scores) ||
          ("final_score" in data && data.final_score)
        if (scorePayload) applyScores(scorePayload as InterviewScores)

        if (data.type === "coaching_hint" && "hint" in data) setLastHint(data.hint)
        if (data.type === "ai_thinking" && "thinking" in data) {
          setAiThinking(Boolean(data.thinking))
        }
        if (data.type === "live_feedback" && data.feedback) {
          setLiveFeedback(data.feedback)
        }
        if (data.type === "phase_update") {
          if ("phase" in data && data.phase) setPhase(data.phase)
          if ("phase_label" in data) setPhaseLabel(data.phase_label)
          if ("progress_pct" in data) setProgressPct(data.progress_pct)
          if ("difficulty" in data && data.difficulty) setDifficulty(data.difficulty)
        }
        if (data.type === "interviewer_message") {
          const msg = data.message || data.question || ""
          const q = data.question || msg
          setLastInterviewerMessage(msg)
          setLastQuestion(q)
          if (data.phase_label) setPhaseLabel(data.phase_label)
          if (data.phase) setPhase(data.phase as InterviewPhaseId)
          if (typeof data.progress_pct === "number") setProgressPct(data.progress_pct)
          appendConversation({ role: "interviewer", content: msg, question: q, phase: data.phase })
        }
        if (data.type === "interviewer_question" && "question" in data) {
          setLastQuestion(data.question)
          if (data.phase_label) setPhaseLabel(data.phase_label)
          if (data.phase) setPhase(data.phase as InterviewPhaseId)
          if (typeof data.progress_pct === "number") setProgressPct(data.progress_pct)
        }
        if (data.type === "interview_complete") {
          setInterviewEnded(true)
          setAiThinking(false)
          if (data.final_report) setFinalReport(data.final_report)
          else if (sessionId) void loadReport(sessionId)
        }
        if (data.type === "content_analysis" && data.content?.summary) {
          setContentSummary(data.content.summary)
        }
        if (data.type === "error" && "message" in data) {
          setError(data.message)
          setAiThinking(false)
        }
      } catch {
        setError("Invalid server message")
      }
    }

    ws.onerror = () => setError("WebSocket connection error")
    ws.onclose = () => {
      setConnected(false)
      const delay = Math.min(1000 * 2 ** reconnectAttempt.current, 15000)
      reconnectAttempt.current += 1
      setTimeout(() => connect(), delay)
    }
  }, [sessionId, appendConversation, applyScores, loadReport])

  useEffect(() => {
    connect()
    const ping = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: "ping" }))
      }
    }, 25000)
    return () => {
      clearInterval(ping)
      wsRef.current?.close()
    }
  }, [connect])

  const send = useCallback((payload: Record<string, unknown>) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(payload))
    } else {
      setError("Sin conexión WebSocket. ¿Está el backend en el puerto 8000?")
    }
  }, [])

  const sendTranscript = useCallback(
    (text: string, confidence = 1) => {
      const trimmed = text.trim()
      if (!trimmed) return
      setTranscriptLines((prev) => [...prev, trimmed])
      appendConversation({ role: "candidate", content: trimmed })
      setAiThinking(true)
      send({ type: "transcript", text: trimmed, confidence })
    },
    [send, appendConversation],
  )

  const sendVideoFrame = useCallback(
    (dataUrl: string) => {
      const b64 = dataUrl.split(",")[1]
      if (b64) send({ type: "video_frame", data: b64 })
    },
    [send],
  )

  const sendAudioChunk = useCallback(
    (base64: string) => {
      if (base64) send({ type: "audio_chunk", data: base64 })
    },
    [send],
  )

  const requestQuestion = useCallback(() => {
    setAiThinking(true)
    send({ type: "request_question", difficulty: difficulty ?? "medium" })
  }, [send, difficulty])

  const endInterview = useCallback(() => {
    setAiThinking(true)
    send({ type: "end_interview" })
  }, [send])

  return {
    connected,
    scores,
    lastHint,
    lastQuestion,
    lastInterviewerMessage,
    liveFeedback,
    finalReport,
    reportLoading,
    interviewEnded,
    aiThinking,
    phase,
    phaseLabel,
    progressPct,
    difficulty,
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
    reconnect: connect,
  }
}
