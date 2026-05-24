/** Bloques de la jornada laboral simulada */
export type WorkBlock = "morning" | "midday" | "afternoon" | "closing" | "urgency"

/** Tipos de entregable real — NO quiz ni opciones múltiples */
export type DeliverableType =
  | "email"
  | "document"
  | "code_review"
  | "bugfix_plan"
  | "client_response"
  | "report"
  | "meeting_notes"
  | "backlog_update"

export interface WorkDaySlot {
  hour: number
  minute: number
  simTimeLabel: string
  label: string
  block: WorkBlock
}

/** Horarios reales de notificación (hora local del usuario) */
export const WORK_DAY_NOTIFICATION_SLOTS: WorkDaySlot[] = [
  { hour: 9, minute: 0, simTimeLabel: "09:00", label: "Brief matutino — tu líder asigna prioridades", block: "morning" },
  { hour: 10, minute: 30, simTimeLabel: "10:30", label: "Entrega intermedia del sprint", block: "morning" },
  { hour: 12, minute: 0, simTimeLabel: "12:00", label: "Antes del almuerzo — cliente esperando respuesta", block: "midday" },
  { hour: 14, minute: 30, simTimeLabel: "14:30", label: "Post-reunión: accionables para hoy", block: "afternoon" },
  { hour: 16, minute: 30, simTimeLabel: "16:30", label: "Revisión de calidad del entregable", block: "afternoon" },
  { hour: 17, minute: 45, simTimeLabel: "17:45", label: "Urgente de cierre de jornada", block: "closing" },
]

/** Modo demo: nueva tarea cada N minutos desde inicio de sesión */
export const COMPRESSED_SLOT_INTERVAL_MINUTES = 8

export const TASK_EXAMPLES_BY_ROLE: Record<string, string[]> = {
  default: [
    "Redactar correo al cliente explicando retraso y plan de recuperación",
    "Documentar decisión técnica con trade-offs para el equipo",
    "Preparar informe de avance con métricas y riesgos",
    "Responder incidente con plan de mitigación paso a paso",
  ],
  frontend: [
    "Corregir bug de UI en checkout y documentar el fix en el PR",
    "Refactorizar componente con criterios de accesibilidad WCAG",
    "Redactar RFC de arquitectura frontend para feature nueva",
    "Responder code review con cambios concretos en el código",
  ],
}

export function storageKeyNotified(sessionId: string, hour: number, minute: number): string {
  return `work-sim-slot-${sessionId}-${hour}-${minute}`
}

export function storageKeyCompressed(sessionId: string, slotIndex: number): string {
  return `work-sim-compressed-${sessionId}-${slotIndex}`
}
