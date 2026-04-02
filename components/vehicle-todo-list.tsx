'use client'

import { useState, useTransition, useRef } from 'react'
import { toast } from 'sonner'
import { Plus, Loader2, Trash2, GripVertical, CheckCircle2, Circle, Clock, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  createVehicleTask,
  updateVehicleTaskStatus,
  deleteVehicleTask,
  type VehicleTask,
  type TaskStatus,
} from '@/lib/actions/vehicle-tasks'

interface Props {
  vehicleId: string
  initialTasks: VehicleTask[]
}

const STATUSES: TaskStatus[] = ['todo', 'in_progress', 'done']

const COLUMNS: {
  key: TaskStatus
  label: string
  color: string
  dot: string
  bg: string
  ring: string
  icon: React.ElementType
}[] = [
  {
    key: 'todo',
    label: 'Pendiente',
    color: 'text-amber-600',
    dot: 'bg-amber-500',
    bg: 'bg-amber-500/10',
    ring: 'ring-amber-500/20',
    icon: Circle,
  },
  {
    key: 'in_progress',
    label: 'En progreso',
    color: 'text-blue-600',
    dot: 'bg-blue-500',
    bg: 'bg-blue-500/10',
    ring: 'ring-blue-500/20',
    icon: Clock,
  },
  {
    key: 'done',
    label: 'Terminado',
    color: 'text-emerald-600',
    dot: 'bg-emerald-500',
    bg: 'bg-emerald-500/10',
    ring: 'ring-emerald-500/20',
    icon: CheckCircle2,
  },
]

const NEXT_STATUS: Record<TaskStatus, TaskStatus | null> = {
  todo: 'in_progress',
  in_progress: 'done',
  done: null,
}

export default function VehicleTodoList({ vehicleId, initialTasks }: Props) {
  const [tasks, setTasks] = useState<VehicleTask[]>(initialTasks)
  const [newTitle, setNewTitle] = useState('')
  const [isPending, startTransition] = useTransition()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [dragOverCol, setDragOverCol] = useState<TaskStatus | null>(null)
  const dragNode = useRef<HTMLDivElement | null>(null)

  function handleAdd() {
    if (!newTitle.trim()) return
    const title = newTitle.trim()
    setNewTitle('')

    const optimistic: VehicleTask = {
      id: `opt-${Date.now()}`,
      vehicle_id: vehicleId,
      workshop_id: '',
      title,
      status: 'todo',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    setTasks((prev) => [...prev, optimistic])

    startTransition(async () => {
      const { task, error } = await createVehicleTask(vehicleId, title)
      if (error) {
        toast.error(error)
        setTasks((prev) => prev.filter((t) => t.id !== optimistic.id))
        return
      }
      setTasks((prev) => prev.map((t) => (t.id === optimistic.id ? task! : t)))
      toast.success('Tarea agregada')
    })
  }

  function handleStatusChange(taskId: string, status: TaskStatus) {
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status } : t)))
    startTransition(async () => {
      const { error } = await updateVehicleTaskStatus(taskId, status, vehicleId)
      if (error) {
        toast.error(error)
        setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: t.status } : t)))
      }
    })
  }

  function handleDelete(taskId: string) {
    setDeletingId(taskId)
    setTasks((prev) => prev.filter((t) => t.id !== taskId))
    startTransition(async () => {
      const { error } = await deleteVehicleTask(taskId, vehicleId)
      if (error) toast.error(error)
      setDeletingId(null)
    })
  }

  // ── Desktop: HTML5 drag & drop ──────────────────────────────────────────
  function handleDragStart(e: React.DragEvent, taskId: string) {
    setDraggingId(taskId)
    e.dataTransfer.effectAllowed = 'move'
  }

  function handleDragOver(e: React.DragEvent, col: TaskStatus) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverCol(col)
  }

  function handleDrop(e: React.DragEvent, col: TaskStatus) {
    e.preventDefault()
    if (!draggingId) return
    const task = tasks.find((t) => t.id === draggingId)
    if (task && task.status !== col) handleStatusChange(draggingId, col)
    setDraggingId(null)
    setDragOverCol(null)
  }

  function handleDragEnd() {
    setDraggingId(null)
    setDragOverCol(null)
  }

  // ── Mobile: Touch drag & drop ───────────────────────────────────────────
  function handleTouchStart(e: React.TouchEvent, taskId: string) {
    setDraggingId(taskId)
  }

  function handleTouchMove(e: React.TouchEvent) {
    e.preventDefault()
    const touch = e.touches[0]
    // Temporarily hide the dragged element so elementFromPoint finds the column beneath it
    const draggingEl = dragNode.current
    if (draggingEl) draggingEl.style.pointerEvents = 'none'
    const el = document.elementFromPoint(touch.clientX, touch.clientY)
    if (draggingEl) draggingEl.style.pointerEvents = ''

    const colEl = el?.closest('[data-column]')
    if (colEl) {
      const col = colEl.getAttribute('data-column') as TaskStatus
      setDragOverCol(col)
    } else {
      setDragOverCol(null)
    }
  }

  function handleTouchEnd() {
    if (draggingId && dragOverCol) {
      const task = tasks.find((t) => t.id === draggingId)
      if (task && task.status !== dragOverCol) {
        handleStatusChange(draggingId, dragOverCol)
      }
    }
    setDraggingId(null)
    setDragOverCol(null)
  }

  const totalDone = tasks.filter((t) => t.status === 'done').length
  const progress = tasks.length > 0 ? Math.round((totalDone / tasks.length) * 100) : 0

  return (
    <div className="bg-card border border-border/60 rounded-2xl shadow-sm overflow-hidden">
      {/* Panel header */}
      <div className="px-6 py-4 border-b border-border/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold">Tareas del vehículo</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {tasks.length === 0
              ? 'Sin tareas aún'
              : `${totalDone} de ${tasks.length} completadas`}
          </p>
        </div>

        {/* Progress bar */}
        {tasks.length > 0 && (
          <div className="flex items-center gap-3 sm:w-56">
            <div className="flex-1 h-1.5 bg-muted/60 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-xs font-medium text-muted-foreground tabular-nums w-8 text-right">
              {progress}%
            </span>
          </div>
        )}
      </div>

      {/* Add task bar */}
      <div className="px-6 py-4 border-b border-border/40 bg-muted/20">
        <div className="flex gap-2">
          <Input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            placeholder="Nueva tarea… (ej: Cambiar pastillas de freno)"
            className="h-10 bg-background border-border/50 text-sm"
            disabled={isPending}
          />
          <Button
            onClick={handleAdd}
            disabled={isPending || !newTitle.trim()}
            size="sm"
            className="h-10 px-4 shrink-0 gap-1.5"
          >
            {isPending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Plus className="w-3.5 h-3.5" />
            )}
            Agregar
          </Button>
        </div>

        {/* Mobile hint */}
        <p className="sm:hidden mt-2 text-[11px] text-muted-foreground/60">
          Tocá el botón <ArrowRight className="inline w-3 h-3" /> en cada tarea para avanzar su estado.
        </p>
      </div>

      {/* Kanban board */}
      <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-border/40">
        {COLUMNS.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.key)
          const isOver = dragOverCol === col.key
          const Icon = col.icon

          return (
            <div
              key={col.key}
              data-column={col.key}
              onDragOver={(e) => handleDragOver(e, col.key)}
              onDrop={(e) => handleDrop(e, col.key)}
              onDragLeave={() => setDragOverCol(null)}
              className={`p-5 min-h-[180px] transition-colors duration-200 ${
                isOver ? 'bg-primary/5' : ''
              }`}
            >
              {/* Column header */}
              <div className="flex items-center gap-2.5 mb-4">
                <div className={`w-2 h-2 rounded-full ${col.dot} shrink-0`} />
                <span className={`text-xs font-semibold uppercase tracking-widest ${col.color}`}>
                  {col.label}
                </span>
                <span className="ml-auto text-xs font-medium text-muted-foreground bg-muted/60 rounded-full px-2 py-0.5 min-w-[20px] text-center">
                  {colTasks.length}
                </span>
              </div>

              {/* Drop zone hint */}
              {colTasks.length === 0 && (
                <div
                  className={`flex items-center justify-center rounded-xl border border-dashed h-16 text-xs transition-all duration-200 ${
                    isOver
                      ? 'border-primary/50 text-primary/60 bg-primary/5 scale-[1.02]'
                      : 'border-border/30 text-muted-foreground/40'
                  }`}
                >
                  {isOver ? '↓ Soltar aquí' : 'Sin tareas'}
                </div>
              )}

              {/* Task cards */}
              <div className="space-y-2">
                {colTasks.map((task) => {
                  const nextStatus = NEXT_STATUS[col.key]
                  const nextCol = nextStatus ? COLUMNS.find((c) => c.key === nextStatus) : null

                  return (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      onDragEnd={handleDragEnd}
                      onTouchStart={(e) => handleTouchStart(e, task.id)}
                      onTouchMove={handleTouchMove}
                      onTouchEnd={handleTouchEnd}
                      ref={draggingId === task.id ? dragNode : undefined}
                      style={{ touchAction: 'none' }}
                      className={`group flex items-start gap-2.5 p-3 rounded-xl border text-sm transition-all duration-150 cursor-grab active:cursor-grabbing select-none ${
                        draggingId === task.id
                          ? 'opacity-30 scale-95 border-primary/30 bg-primary/5'
                          : 'bg-background border-border/40 hover:border-border/70 hover:shadow-sm'
                      }`}
                    >
                      {/* Grab handle — solo se ve en desktop */}
                      <GripVertical className="hidden sm:block w-4 h-4 text-muted-foreground/25 group-hover:text-muted-foreground/50 mt-0.5 shrink-0 transition-colors" />

                      <Icon
                        className={`w-4 h-4 shrink-0 mt-0.5 ${col.color} opacity-70`}
                      />

                      <span
                        className={`flex-1 leading-snug wrap-break-word min-w-0 ${
                          col.key === 'done'
                            ? 'line-through text-muted-foreground/60'
                            : 'text-foreground'
                        }`}
                      >
                        {task.title}
                      </span>

                      <div className="flex items-center gap-1 shrink-0 mt-0.5">
                        {/* Botón avanzar estado — siempre visible en mobile, hover en desktop */}
                        {nextCol && (
                          <button
                            onClick={() => handleStatusChange(task.id, nextStatus!)}
                            title={`Mover a ${nextCol.label}`}
                            className={`flex items-center justify-center w-6 h-6 rounded-md transition-all
                              sm:opacity-0 sm:group-hover:opacity-100
                              ${nextCol.bg} ${nextCol.color} hover:scale-110`}
                          >
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}

                        {/* Botón eliminar */}
                        <button
                          onClick={() => handleDelete(task.id)}
                          disabled={deletingId === task.id}
                          title="Eliminar tarea"
                          className="flex items-center justify-center w-6 h-6 rounded-md transition-all sm:opacity-0 sm:group-hover:opacity-100 text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
