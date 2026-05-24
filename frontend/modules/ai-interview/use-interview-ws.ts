"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import type { InterviewScores, InterviewWsEvent } from "./types"
import { getInterviewWsUrl } from "./api"

export function useInterviewWebSocket(sessionId: string | null) {
  const wsRef = useRef<WebSocket | null>(null)
  const [connected, setConnected] = useState(false)
  const [scores, setScores] = useState<InterviewScores | null>(null)
  const [lastHint, setLastHint] = useState<string | null>(null)
  const [lastQuestion, setLastQuestion] = useState<string | null>(null)
  const [events, setEvents] = useState<InterviewWsEvent[]>([])
  const [error, setError] = useState<string | null>(null)

  const connect = useCallback(() => {
    if (!sessionId || wsRef.current?.readyState === WebSocket.OPEN) return

    const ws = new WebSocket(getInterviewWsUrl(sessionId))
    wsRef.current = ws

    ws.onopen = () => {
      setConnected(true)
      setError(null)
    }

    ws.onmessage = (ev) => {
      try {
        const data = JSON.parse(ev.data) as InterviewWsEvent
        setEvents((prev) => [...prev.slice(-50), data])

        if ("scores" in data && data.scores) {
          setScores(data.scores as InterviewScores)
        }
        if (data.type === "coaching_hint" && "hint" in data) {
          setLastHint(data.hint)
        }
        if (data.type === "interviewer_question" && "question" in data) {
          setLastQuestion(data.question)
        }
        if (data.type === "interview_complete" && "final_score" in data) {
          setScores(data.final_score as InterviewScores)
        }
        if (data.type === "error" && "message" in data) {
          setError(data.message)
        }
      } catch {
        setError("Invalid server message")
      }
    }

    ws.onerror = () => setError("WebSocket connection error")
    ws.onclose = () => setConnected(false)
  }, [sessionId])

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
    }
  }, [])

  const sendTranscript = useCallback(
    (text: string, confidence = 1) => {
      send({ type: "transcript", text, confidence })
    },
    [send],
  )

  const sendVideoFrame = useCallback(
    (dataUrl: string) => {
      const b64 = dataUrl.split(",")[1]
      if (b64) send({ type: "video_frame", data: b64 })
    },
    [send],
  )

  const requestQuestion = useCallback(() => {
    send({ type: "request_question", difficulty: "medium" })
  }, [send])

  const endInterview = useCallback(() => {
    send({ type: "end_interview" })
  }, [send])

  return {
    connected,
    scores,
    lastHint,
    lastQuestion,
    events,
    error,
    sendTranscript,
    sendVideoFrame,
    requestQuestion,
    endInterview,
    reconnect: connect,
  }
}
