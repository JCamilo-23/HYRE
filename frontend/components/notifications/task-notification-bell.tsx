"use client"

import { useMemo, useState } from "react"
import {
  Bell,
  BellOff,
  CheckCheck,
  ChevronRight,
  Clock,
  Inbox,
  Sparkles,
} from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  useTaskNotificationsStore,
  type TaskNotificationItem,
} from "@/store/task-notifications-store"

interface TaskNotificationBellProps {
  variant?: "default" | "compact" | "header"
  notificationsEnabled?: boolean
  onRequestPermission?: () => Promise<boolean> | void
  onNavigateToSimulator?: () => void
  timeLeftSeconds?: number | null
  className?: string
}

function formatTimeLeft(seconds: number | null | undefined): string | null {
  if (seconds == null) return null
  if (seconds <= 0) return "Vencido"
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, "0")}`
}

function urgencyStyles(urgency?: string) {
  const u = urgency?.toLowerCase() ?? ""
  if (u.includes("urgent") || u.includes("urgente")) {
    return "border-red-500/30 bg-red-500/10 text-red-300"
  }
  if (u.includes("alta") || u.includes("high")) {
    return "border-amber-500/30 bg-amber-500/10 text-amber-300"
  }
  return "border-[#7C3AED]/30 bg-[#7C3AED]/10 text-[#C4B5FD]"
}

function NotificationRow({
  item,
  timeLeft,
  onMarkRead,
  onOpenSimulator,
}: {
  item: TaskNotificationItem
  timeLeft?: string | null
  onMarkRead: (id: string) => void
  onOpenSimulator?: () => void
}) {
  const isActive = item.status === "active"
  const isUpcoming = item.status === "upcoming"

  return (
    <button
      type="button"
      onClick={() => {
        if (!item.read) onMarkRead(item.id)
        if (isActive && onOpenSimulator) onOpenSimulator()
      }}
      className={cn(
        "group w-full rounded-xl border p-3 text-left transition-colors",
        !item.read && !isUpcoming && "border-[#7C3AED]/40 bg-[#7C3AED]/5",
        item.read && "border-[#334155] bg-[#1E293B]/60 hover:bg-[#1E293B]",
        isActive && "border-amber-500/40 bg-amber-500/5 hover:bg-amber-500/10",
        isUpcoming && "border-[#334155]/80 bg-transparent opacity-80",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-1.5">
            {item.simTimeLabel && (
              <span className="font-mono text-[10px] text-[#64748B]">{item.simTimeLabel}</span>
            )}
            {item.urgency && (
              <Badge
                variant="outline"
                className={cn("h-4 px-1.5 text-[9px] uppercase", urgencyStyles(item.urgency))}
              >
                {item.urgency}
              </Badge>
            )}
            {isActive && (
              <Badge className="h-4 bg-amber-500/20 px-1.5 text-[9px] text-amber-300 hover:bg-amber-500/20">
                En curso
              </Badge>
            )}
            {!item.read && !isUpcoming && (
              <span className="h-1.5 w-1.5 rounded-full bg-[#7C3AED]" aria-hidden />
            )}
          </div>
          <p className="line-clamp-2 text-sm font-medium text-[#F1F5F9]">{item.title}</p>
          {item.description && (
            <p className="mt-1 line-clamp-2 text-xs text-[#94A3B8]">{item.description}</p>
          )}
          {item.assignedBy && (
            <p className="mt-1 text-[10px] text-[#64748B]">Asignado por {item.assignedBy}</p>
          )}
        </div>
        {isActive && timeLeft && (
          <div className="flex shrink-0 items-center gap-1 rounded-md bg-[#0F172A] px-2 py-1 font-mono text-[10px] text-amber-400">
            <Clock className="h-3 w-3" />
            {timeLeft}
          </div>
        )}
      </div>
      {isActive && onOpenSimulator && (
        <p className="mt-2 flex items-center gap-1 text-[10px] text-[#C4B5FD] opacity-0 transition-opacity group-hover:opacity-100">
          Ir al simulador
          <ChevronRight className="h-3 w-3" />
        </p>
      )}
    </button>
  )
}

export function TaskNotificationBell({
  variant = "default",
  notificationsEnabled = false,
  onRequestPermission,
  onNavigateToSimulator,
  timeLeftSeconds,
  className,
}: TaskNotificationBellProps) {
  const [open, setOpen] = useState(false)
  const items = useTaskNotificationsStore((s) => s.items)
  const markAsRead = useTaskNotificationsStore((s) => s.markAsRead)
  const markAllAsRead = useTaskNotificationsStore((s) => s.markAllAsRead)
  const pendingCount = useTaskNotificationsStore((s) => s.pendingCount())

  const { active, upcoming, recent } = useMemo(() => {
    const activeItem = items.find((i) => i.status === "active") ?? null
    const upcomingItems = items.filter((i) => i.status === "upcoming").slice(0, 4)
    const recentItems = items
      .filter((i) => i.status === "completed" || (!i.read && i.status !== "active"))
      .slice(0, 5)
    return { active: activeItem, upcoming: upcomingItems, recent: recentItems }
  }, [items])

  const timeLeft = formatTimeLeft(timeLeftSeconds)
  const badgeCount = useMemo(() => {
    const pending = pendingCount
    if (pending > 0) return pending
    if (active) return 1
    return upcoming.length > 0 ? Math.min(upcoming.length, 9) : 0
  }, [pendingCount, active, upcoming.length])

  const triggerClass =
    variant === "header"
      ? "h-8 w-8 rounded-lg border border-[#334155] bg-[#1E293B] text-[#F1F5F9] hover:bg-[#334155]"
      : variant === "compact"
        ? "h-9 w-9 glass rounded-full text-[#F1F5F9] hover:bg-white/10"
        : "h-10 w-10 glass rounded-full text-[#F1F5F9] hover:bg-white/10"

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "relative flex items-center justify-center transition-colors",
            triggerClass,
            className,
          )}
          aria-label={`Notificaciones${badgeCount ? `, ${badgeCount} pendientes` : ""}`}
        >
          <Bell className={cn(variant === "header" ? "h-3.5 w-3.5" : "h-5 w-5")} />
          {badgeCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#EF4444] px-1 text-[10px] font-semibold text-white">
              {badgeCount > 9 ? "9+" : badgeCount}
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[min(100vw-2rem,380px)] border-[#334155] bg-[#0F172A] p-0 shadow-xl shadow-black/40"
      >
        <div className="border-b border-[#334155] px-4 py-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-semibold text-[#F1F5F9]">Tareas pendientes</h3>
              <p className="text-[11px] text-[#64748B]">Simulador laboral · jornada en vivo</p>
            </div>
            {items.some((i) => !i.read) && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 text-[10px] text-[#94A3B8] hover:text-[#F1F5F9]"
                onClick={() => markAllAsRead()}
              >
                <CheckCheck className="mr-1 h-3 w-3" />
                Leídas
              </Button>
            )}
          </div>
        </div>

        <div className="max-h-[min(60vh,420px)] space-y-4 overflow-y-auto p-3">
          {active && (
            <section>
              <p className="mb-2 px-1 text-[10px] font-medium uppercase tracking-wider text-amber-400">
                Tarea activa
              </p>
              <NotificationRow
                item={active}
                timeLeft={timeLeft}
                onMarkRead={markAsRead}
                onOpenSimulator={() => {
                  onNavigateToSimulator?.()
                  setOpen(false)
                }}
              />
            </section>
          )}

          {upcoming.length > 0 && (
            <section>
              <p className="mb-2 px-1 text-[10px] font-medium uppercase tracking-wider text-[#64748B]">
                Próximas asignaciones
              </p>
              <div className="space-y-2">
                {upcoming.map((item) => (
                  <NotificationRow key={item.id} item={item} onMarkRead={markAsRead} />
                ))}
              </div>
            </section>
          )}

          {!active && upcoming.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#1E293B]">
                <Inbox className="h-6 w-6 text-[#64748B]" />
              </div>
              <p className="text-sm font-medium text-[#F1F5F9]">Sin tareas pendientes</p>
              <p className="mt-1 max-w-[240px] text-xs text-[#64748B]">
                Inicia la jornada en el simulador o activa las notificaciones automáticas.
              </p>
            </div>
          )}

          {recent.length > 0 && (
            <section>
              <p className="mb-2 px-1 text-[10px] font-medium uppercase tracking-wider text-[#64748B]">
                Recientes
              </p>
              <div className="space-y-2">
                {recent.map((item) => (
                  <NotificationRow key={item.id} item={item} onMarkRead={markAsRead} />
                ))}
              </div>
            </section>
          )}
        </div>

        <div className="space-y-2 border-t border-[#334155] p-3">
          {onRequestPermission && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 w-full border-[#334155] text-xs text-[#E2E8F0] hover:bg-[#1E293B]"
              onClick={() => void onRequestPermission()}
            >
              {notificationsEnabled ? (
                <>
                  <Bell className="mr-1.5 h-3.5 w-3.5 text-[#22C55E]" />
                  Alertas del navegador activas
                </>
              ) : (
                <>
                  <BellOff className="mr-1.5 h-3.5 w-3.5" />
                  Activar alertas del navegador
                </>
              )}
            </Button>
          )}
          {onNavigateToSimulator && (
            <Button
              type="button"
              size="sm"
              className="h-8 w-full bg-[#7C3AED] text-xs hover:bg-[#6D28D9]"
              onClick={() => {
                onNavigateToSimulator()
                setOpen(false)
              }}
            >
              <Sparkles className="mr-1.5 h-3.5 w-3.5" />
              Abrir simulador laboral
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
