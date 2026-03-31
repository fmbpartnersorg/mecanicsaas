'use client'

import { useState, useTransition } from 'react'
import { updateRepairStatus } from '@/lib/actions/repair-jobs'
import type { RepairJob, RepairStatus } from '@/lib/types'
import { STATUS_LABELS, STATUS_COLORS } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import Link from 'next/link'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { ChevronRight, Loader2 } from 'lucide-react'

type JobWithVehicle = RepairJob & {
  vehicles: {
    plate_number: string
    brand: string | null
    model: string | null
    client_name: string | null
  } | null
}

interface Props {
  initialJobs: JobWithVehicle[]
}

const COLUMNS: { status: RepairStatus; label: string; nextStatus?: RepairStatus; nextLabel?: string }[] = [
  { status: 'pending', label: 'Pendiente', nextStatus: 'in_progress', nextLabel: 'Iniciar' },
  { status: 'in_progress', label: 'En Proceso', nextStatus: 'completed', nextLabel: 'Terminar' },
  { status: 'completed', label: 'Terminado' },
]

function JobCard({
  job,
  nextStatus,
  nextLabel,
}: {
  job: JobWithVehicle
  nextStatus?: RepairStatus
  nextLabel?: string
}) {
  const [isPending, startTransition] = useTransition()

  function handleAdvance() {
    if (!nextStatus) return
    startTransition(async () => {
      const { error } = await updateRepairStatus(job.id, nextStatus)
      if (error) toast.error(error)
      else toast.success(`Trabajo movido a "${STATUS_LABELS[nextStatus]}"`)
    })
  }

  return (
    <div className="bg-card border border-border rounded-xl p-4 space-y-3">
      {/* Plate + vehicle */}
      <Link
        href={`/vehiculo/${job.vehicle_id}`}
        className="flex items-center justify-between group"
      >
        <div>
          <span className="font-mono font-semibold text-sm tracking-wider">
            {job.vehicles?.plate_number ?? '—'}
          </span>
          <p className="text-xs text-muted-foreground mt-0.5">
            {[job.vehicles?.brand, job.vehicles?.model].filter(Boolean).join(' ') || 'Sin modelo'}
          </p>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
      </Link>

      {/* Description */}
      {job.description && (
        <p className="text-xs text-muted-foreground/80 line-clamp-2 leading-relaxed">
          {job.description}
        </p>
      )}

      {/* Date */}
      <div className="flex items-center justify-between">
        <time className="text-[11px] text-muted-foreground/60">
          {format(new Date(job.created_at), "d MMM", { locale: es })}
        </time>

        {nextStatus && (
          <button
            onClick={handleAdvance}
            disabled={isPending}
            className="text-[11px] font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-1 disabled:opacity-40"
          >
            {isPending ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              nextLabel
            )}
          </button>
        )}
      </div>
    </div>
  )
}

export default function JobBoard({ initialJobs }: Props) {
  const jobs = initialJobs

  return (
    <div className="flex sm:grid sm:grid-cols-3 gap-4 overflow-x-auto pb-4 snap-x snap-mandatory touch-pan-x hide-scrollbars -mx-4 px-4 sm:mx-0 sm:px-0">
      {COLUMNS.map(({ status, label, nextStatus, nextLabel }) => {
        const columnJobs = jobs.filter((j) => j.status === status)
        return (
          <div key={status} className="min-w-[85vw] sm:min-w-0 snap-center shrink-0 flex flex-col">
            {/* Column header */}
            <div className="flex items-center gap-2 mb-3">
              <Badge
                className={`${STATUS_COLORS[status]} border text-xs font-medium`}
              >
                {label}
              </Badge>
              <span className="text-xs text-muted-foreground/60">
                {columnJobs.length}
              </span>
            </div>

            {/* Cards */}
            <div className="space-y-2 min-h-[300px] flex-1">
              {columnJobs.length === 0 ? (
                <div className="border border-dashed border-border rounded-xl py-8 text-center text-xs text-muted-foreground/40 h-full flex items-center justify-center">
                  Sin trabajos
                </div>
              ) : (
                columnJobs.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    nextStatus={nextStatus}
                    nextLabel={nextLabel}
                  />
                ))
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
