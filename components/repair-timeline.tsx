import type { RepairJob } from '@/lib/types'
import { STATUS_LABELS, STATUS_COLORS } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Gauge, FileText } from 'lucide-react'

interface Props {
  jobs: RepairJob[]
}

export default function RepairTimeline({ jobs }: Props) {
  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-[22px] top-3 bottom-3 w-px bg-border" />

      <div className="space-y-4">
        {jobs.map((job, idx) => (
          <div key={job.id} className="relative flex gap-4">
            {/* Timeline dot */}
            <div
              className={`
                relative z-10 w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 text-xs font-bold
                ${idx === 0
                  ? 'bg-primary/10 border-primary/30 text-primary'
                  : 'bg-secondary border-border text-muted-foreground'
                }
              `}
            >
              {idx === 0 ? '★' : jobs.length - idx}
            </div>

            {/* Card */}
            <div className="flex-1 bg-card border border-border rounded-xl p-4 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-2">
                <time className="text-xs text-muted-foreground">
                  {format(new Date(job.created_at), "d 'de' MMMM, yyyy", { locale: es })}
                </time>
                <Badge
                  className={`${STATUS_COLORS[job.status]} border text-xs font-medium shrink-0`}
                >
                  {STATUS_LABELS[job.status]}
                </Badge>
              </div>

              {job.description && (
                <div className="flex gap-2 mt-2">
                  <FileText className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
                  <p className="text-sm text-foreground/90 leading-relaxed">
                    {job.description}
                  </p>
                </div>
              )}

              {job.mileage && (
                <div className="flex items-center gap-2 mt-2">
                  <Gauge className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {job.mileage.toLocaleString('es-AR')} km
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
