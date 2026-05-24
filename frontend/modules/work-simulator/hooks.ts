"use client"

import { useCallback, useState } from "react"
import {
  createWorkSimulatorSession,
  evaluateWorkChallengeResponse,
  generateWorkChallenge,
  sendWorkSimulatorMessage,
} from "./api"
import type { WorkChallenge, WorkSimulatorMessage, WorkSimulatorSession } from "./types"

export function useWorkSimulator() {
  const [session, setSession] = useState<WorkSimulatorSession | null>(null)
  const [messages, setMessages] = useState<WorkSimulatorMessage[]>([])
  const [currentChallenge, setCurrentChallenge] = useState<WorkChallenge | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const startSession = useCallback(
    async (input: { job_id?: string; role_title?: string; company_name?: string }) => {
      setLoading(true)
      setError(null)
      try {
        const created = await createWorkSimulatorSession(input)
        setSession(created)
        setMessages(created.messages ?? [])
        setCurrentChallenge(created.scenario_context?.current_challenge ?? null)
        return created
      } catch (e) {
        const msg = e instanceof Error ? e.message : "No se pudo iniciar la simulación"
        setError(msg)
        throw e
      } finally {
        setLoading(false)
      }
    },
    [],
  )

  const sendMessage = useCallback(
    async (text: string) => {
      if (!session) return
      setLoading(true)
      setError(null)
      const previousMessages = messages
      setMessages((m) => [...m, { role: "user", content: text }])
      try {
        const res = await sendWorkSimulatorMessage(session.id, text)
        setMessages(res.messages)
        setSession((s) => (s ? { ...s, messages: res.messages } : s))
        return res.reply
      } catch (e) {
        setMessages(previousMessages)
        const msg = e instanceof Error ? e.message : "Error al enviar mensaje"
        setError(msg)
        throw e
      } finally {
        setLoading(false)
      }
    },
    [session, messages],
  )

  const requestChallenge = useCallback(async () => {
    if (!session) {
      setError("Espera a que cargue la sesión...")
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await generateWorkChallenge(session.id)
      setSession(res.session)
      setMessages(res.session.messages)
      setCurrentChallenge(res.challenge)
      return res.challenge
    } catch (e) {
      const msg = e instanceof Error ? e.message : "No se pudo generar el reto"
      setError(msg)
      throw e
    } finally {
      setLoading(false)
    }
  }, [session])

  const submitChallengeResponse = useCallback(
    async (response: string) => {
      if (!session) return
      setLoading(true)
      setError(null)
      try {
        const res = await evaluateWorkChallengeResponse(session.id, response)
        setSession(res.session)
        setMessages(res.session.messages)
        setCurrentChallenge(null)
        return res.evaluation
      } catch (e) {
        const msg = e instanceof Error ? e.message : "No se pudo evaluar la respuesta"
        setError(msg)
        throw e
      } finally {
        setLoading(false)
      }
    },
    [session],
  )

  return {
    session,
    messages,
    currentChallenge,
    loading,
    error,
    startSession,
    sendMessage,
    requestChallenge,
    submitChallengeResponse,
  }
}
