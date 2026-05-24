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

export const TASK_EXAMPLES_BY_INDUSTRY: Record<string, string[]> = {
  default: [
    "Informe de avance semanal con metricas y riesgos",
    "Correo profesional a stakeholder con plan de accion",
    "Documento de decision con trade-offs para el equipo",
  ],
  tecnologia: [
    "Plan de mitigacion de incidente en produccion con pasos tecnicos",
    "Code review con feedback accionable y criterios de merge",
    "RFC de arquitectura para nueva feature con impacto en sistema",
    "Postmortem de bug critico con prevencion futura",
  ],
  diseno: [
    "Informe de usabilidad con hallazgos y recomendaciones priorizadas",
    "Presentacion de propuesta visual con rationale de UX",
    "Documento de design system con tokens y componentes",
    "Plan de research con usuarios y guion de entrevistas",
  ],
  fintech: [
    "Informe de cumplimiento regulatorio con checklist de controles",
    "Respuesta a alerta de fraude con plan de contencion",
    "Analisis de metricas de conversion con hipotesis de mejora",
    "Comunicacion a usuarios sobre incidente de pagos",
  ],
}

export const INDUSTRY_TASK_FOCUS: Record<string, string> = {
  default: "entregables corporativos generales: informes, correos y planes de accion",
  tecnologia:
    "ingenieria de software: incidentes, code reviews, arquitectura, bugs en produccion y comunicacion tecnica",
  diseno:
    "diseno UX/UI: research, usabilidad, propuestas visuales, design systems y presentaciones a stakeholders",
  fintech:
    "producto financiero: compliance, fraude, metricas de pagos, riesgo operacional y comunicacion regulatoria",
}

export function storageKeyNotified(sessionId: string, hour: number, minute: number): string {
  return `work-sim-slot-${sessionId}-${hour}-${minute}`
}

export function storageKeyCompressed(sessionId: string, slotIndex: number): string {
  return `work-sim-compressed-${sessionId}-${slotIndex}`
}
