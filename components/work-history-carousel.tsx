'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, CheckCircle2, ClipboardList, Calendar } from 'lucide-react'
import type { WorkSession } from '@/lib/actions/work-history'

interface Props {
  sessions: WorkSession[]
}

const VISIBLE = 3 // cuántas cards se ven a la vez

function formatDate(dateStr: string) {
  const [year, month, day] = dateStr.split('-')
  const d = new Date(Number(year), Number(month) - 1, Number(day))
  return d.toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function WorkHistoryCarousel({ sessions }: Props) {
  const [start, setStart] = useState(0)

  if (sessions.length === 0) {
    return (
      <div className="bg-card border border-border/60 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-border/40 flex items-center gap-2">
          <ClipboardList className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-base font-semibold">Historial de trabajos realizados</h2>
        </div>
        <div className="flex items-center justify-center py-14 text-sm text-muted-foreground">
          No hay trabajos completados aún para este vehículo.
        </div>
      </div>
    )
  }

  const canPrev = start > 0
  const canNext = start + VISIBLE < sessions.length
  const visible = sessions.slice(start, start + VISIBLE)

  return (
    <div className="bg-card border border-border/60 rounded-2xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border/40 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <ClipboardList className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-base font-semibold">Historial de trabajos realizados</h2>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">
            {sessions.length} {sessions.length === 1 ? 'sesión' : 'sesiones'}
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => setStart((s) => Math.max(0, s - 1))}
              disabled={!canPrev}
              aria-label="Anterior"
              className="w-7 h-7 rounded-lg border border-border/60 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setStart((s) => Math.min(sessions.length - VISIBLE, s + 1))}
              disabled={!canNext}
              aria-label="Siguiente"
              className="w-7 h-7 rounded-lg border border-border/60 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Cards */}
      <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {visible.map((session) => (
          <SessionCard key={session.date} session={session} />
        ))}
        {/* Relleno si hay menos de VISIBLE sesiones */}
        {visible.length < VISIBLE &&
          Array.from({ length: VISIBLE - visible.length }).map((_, i) => (
            <div key={`empty-${i}`} className="hidden lg:block" />
          ))}
      </div>

      {/* Dots indicator */}
      {sessions.length > VISIBLE && (
        <div className="flex justify-center gap-1.5 pb-4">
          {Array.from({ length: sessions.length - VISIBLE + 1 }).map((_, i) => (
            <button
              key={i}
              onClick={() => setStart(i)}
              className={`rounded-full transition-all duration-200 ${
                i === start
                  ? 'w-4 h-1.5 bg-primary'
                  : 'w-1.5 h-1.5 bg-border hover:bg-muted-foreground/40'
              }`}
              aria-label={`Ir a página ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function SessionCard({ session }: { session: WorkSession }) {
  const MAX_VISIBLE_TASKS = 3
  const extra = session.totalTasks - MAX_VISIBLE_TASKS
  const shownTasks = session.tasks.slice(0, MAX_VISIBLE_TASKS)

  return (
    <div className="bg-background border border-border/60 rounded-xl p-4 flex flex-col gap-3 hover:border-border hover:shadow-sm transition-all duration-150">
      {/* Card header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground leading-tight">
              Trabajo #{session.sessionNumber}
            </p>
            <p className="text-[10px] text-muted-foreground">
              {session.totalTasks} {session.totalTasks === 1 ? 'tarea' : 'tareas'}
            </p>
          </div>
        </div>
        <span className="text-[10px] font-semibold uppercase tracking-wider bg-emerald-100 text-emerald-700 border border-emerald-300 rounded-full px-2 py-0.5 shrink-0">
          Completado
        </span>
      </div>

      {/* Date */}
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Calendar className="w-3 h-3 shrink-0" />
        <span>{formatDate(session.date)}</span>
      </div>

      {/* Divider */}
      <div className="border-t border-border/40" />

      {/* Task list */}
      <div className="space-y-1.5">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Tareas realizadas:
        </p>
        <ul className="space-y-1">
          {shownTasks.map((task, i) => (
            <li key={i} className="flex items-start gap-1.5 text-xs text-foreground/80">
              <span className="w-1 h-1 rounded-full bg-primary mt-1.5 shrink-0" />
              <span className="leading-snug">{task}</span>
            </li>
          ))}
          {extra > 0 && (
            <li className="text-xs text-muted-foreground pl-2.5">
              +{extra} {extra === 1 ? 'tarea más' : 'tareas más'}
            </li>
          )}
        </ul>
      </div>
    </div>
  )
}
