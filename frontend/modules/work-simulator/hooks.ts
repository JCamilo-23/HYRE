"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import {
  createWorkSimulatorSession,
  evaluateWorkChallengeResponse,
  generateWorkChallenge,
  sendWorkSimulatorMessage,
} from "./api"
import { WORK_DAY_NOTIFICATION_SLOTS } from "./constants"
import { useWorkDayNotifications } from "./use-work-day-notifications"
import type { GenerateChallengeOptions, WorkChallenge, WorkSimulatorMessage, WorkSimulatorSession } from "./types"
import { useTaskNotificationsStore } from "@/store/task-notifications-store"

export function useWorkSimulator() {
  const [session, setSession] = useState<WorkSimulatorSession | null>(null)
  const [messages, setMessages] = useState<WorkSimulatorMessage[]>([])
  const [currentChallenge, setCurrentChallenge] = useState<WorkChallenge | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [compressedMode, setCompressedMode] = useState(false)
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number | null>(null)
  const prevChallengeRef = useRef<WorkChallenge | null>(null)

  const syncActiveChallenge = useTaskNotificationsStore((s) => s.syncActiveChallenge)
  const completeActiveTask = useTaskNotificationsStore((s) => s.completeActiveTask)
  const syncUpcomingSlots = useTaskNotificationsStore((s) => s.syncUpcomingSlots)
  const setPushEnabled = useTaskNotificationsStore((s) => s.setPushEnabled)

  const applySession = useCallback((s: WorkSimulatorSession) => {
    setSession(s)
    setMessages(s.messages ?? [])
    setCurrentChallenge(s.scenario_context?.current_challenge ?? null)
  }, [])

  const startSession = useCallback(
    async (input: { job_id?: string; role_title?: string; company_name?: string }) => {
      setLoading(true)
      setError(null)
      try {
        const created = await createWorkSimulatorSession(input)
        applySession(created)
        return created
      } catch (e) {
        const msg = e instanceof Error ? e.message : "No se pudo iniciar la simulación"
        setError(msg)
        throw e
      } finally {
        setLoading(false)
      }
    },
    [applySession],
  )

  const requestChallenge = useCallback(
    async (options: GenerateChallengeOptions = { source: "manual" }) => {
      if (!session) {
        setError("Espera a que cargue la sesión...")
        return
      }
      setLoading(true)
      setError(null)
      try {
        const res = await generateWorkChallenge(session.id, options)
        applySession(res.session)
        return res.challenge
      } catch (e) {
        const msg = e instanceof Error ? e.message : "No se pudo generar la tarea"
        setError(msg)
        throw e
      } finally {
        setLoading(false)
      }
    },
    [session, applySession],
  )

  const onScheduledTask = useCallback(
    async (options: GenerateChallengeOptions) => {
      await requestChallenge(options)
    },
    [requestChallenge],
  )

  const { notificationsEnabled, nextSlotLabel, requestNotificationPermission } =
    useWorkDayNotifications({
      sessionId: session?.id ?? null,
      simulationStartedAt: session?.scenario_context?.simulation_started_at ?? null,
      compressedMode,
      hasActiveChallenge: !!currentChallenge,
      loading,
      onScheduledTask,
    })

  useEffect(() => {
    setPushEnabled(notificationsEnabled)
  }, [notificationsEnabled, setPushEnabled])

  useEffect(() => {
    syncActiveChallenge(currentChallenge)
    if (prevChallengeRef.current && !currentChallenge) {
      completeActiveTask()
    }
    prevChallengeRef.current = currentChallenge
  }, [currentChallenge, syncActiveChallenge, completeActiveTask])

  useEffect(() => {
    if (!session) return
    const now = new Date()
    const upcoming = WORK_DAY_NOTIFICATION_SLOTS.filter((slot) => {
      const slotDate = new Date()
      slotDate.setHours(slot.hour, slot.minute, 0, 0)
      return slotDate.getTime() > now.getTime()
    }).map((slot) => ({
      id: `upcoming-${slot.hour}-${slot.minute}`,
      simTimeLabel: slot.simTimeLabel,
      label: slot.label,
    }))
    syncUpcomingSlots(upcoming)
  }, [session, syncUpcomingSlots])

  const sendMessage = useCallback(
    async (text: string) => {
      if (!session) return
      setLoading(true)
      setError(null)
      const previousMessages = messages
      setMessages((m) => [...m, { role: "user", content: text }])
      try {
        const res = await sendWorkSimulatorMessage(session.id, text)
        applySession(res.session)
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
    [session, messages, applySession],
  )

  const submitChallengeResponse = useCallback(
    async (response: string) => {
      if (!session) return
      setLoading(true)
      setError(null)
      try {
        const res = await evaluateWorkChallengeResponse(session.id, response)
        applySession(res.session)
        setTimeLeftSeconds(null)
        return res.evaluation
      } catch (e) {
        const msg = e instanceof Error ? e.message : "No se pudo evaluar la entrega"
        setError(msg)
        throw e
      } finally {
        setLoading(false)
      }
    },
    [session, applySession],
  )

  useEffect(() => {
    if (!currentChallenge?.deadline_at) {
      setTimeLeftSeconds(null)
      return
    }

    const update = () => {
      const diff = Math.floor(
        (new Date(currentChallenge.deadline_at).getTime() - Date.now()) / 1000,
      )
      setTimeLeftSeconds(diff)
    }
    update()
    const id = window.setInterval(update, 1000)
    return () => window.clearInterval(id)
  }, [currentChallenge])

  return {
    session,
    messages,
    currentChallenge,
    loading,
    error,
    compressedMode,
    setCompressedMode,
    timeLeftSeconds,
    notificationsEnabled,
    nextSlotLabel,
    requestNotificationPermission,
    startSession,
    sendMessage,
    requestChallenge,
    submitChallengeResponse,
  }
}
