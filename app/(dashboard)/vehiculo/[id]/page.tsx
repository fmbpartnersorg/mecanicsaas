import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import RepairTimeline from '@/components/repair-timeline'
import NewJobButton from '@/components/new-job-button'
import VehicleActions from '@/components/vehicle-actions'
import Link from 'next/link'
import { ChevronLeft, Car, Phone, User } from 'lucide-react'
import type { Vehicle, RepairJob } from '@/lib/types'
import { STATUS_LABELS, STATUS_COLORS } from '@/lib/types'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase
    .from('vehicles')
    .select('plate_number, brand, model')
    .eq('id', id)
    .single()

  if (!data) return { title: 'Vehículo — MecaGest' }
  return { title: `${data.plate_number} · ${data.brand ?? ''} ${data.model ?? ''} — MecaGest` }
}

export default async function VehiclePage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: vehicle, error } = await supabase
    .from('vehicles')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !vehicle) notFound()

  const { data: jobs } = await supabase
    .from('repair_jobs')
    .select('*')
    .eq('vehicle_id', id)
    .order('created_at', { ascending: false })

  const v = vehicle as Vehicle
  const repairJobs = (jobs ?? []) as RepairJob[]
  const metadata = v.vehicle_metadata as Record<string, string>

  const activeJob = repairJobs.find(
    (j) => j.status === 'pending' || j.status === 'in_progress'
  )

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in duration-500">
      {/* Back */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ChevronLeft className="w-4 h-4" />
        Volver al comando
      </Link>

      {/* Vehicle header */}
      <div className="bg-card border border-border/60 rounded-2xl p-6 mb-8 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <Car className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold font-mono tracking-widest text-foreground">
                {v.plate_number}
              </h1>
              <p className="text-sm font-medium text-muted-foreground mt-1">
                {[v.brand, v.model].filter(Boolean).join(' ') || 'Sin modelo registrado'}
                {metadata?.cc && ` · ${metadata.cc}cc`}
              </p>
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-3 shrink-0">
            {activeJob && (
              <Badge
                className={`${STATUS_COLORS[activeJob.status]} border text-xs tracking-wider uppercase font-semibold shrink-0`}
              >
                {STATUS_LABELS[activeJob.status]}
              </Badge>
            )}
            <VehicleActions vehicle={v} />
          </div>
        </div>

        {/* Client info */}
        {(v.client_name || v.client_phone) && (
          <div className="mt-4 pt-4 border-t border-border flex flex-col sm:flex-row gap-3">
            {v.client_name && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="w-3.5 h-3.5" />
                <span>{v.client_name}</span>
              </div>
            )}
            {v.client_phone && (
              <a
                href={`tel:${v.client_phone}`}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>{v.client_phone}</span>
              </a>
            )}
          </div>
        )}
      </div>

      {/* Timeline header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-medium">Historial de trabajos</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {repairJobs.length} {repairJobs.length === 1 ? 'entrada' : 'entradas'}
          </p>
        </div>
        <NewJobButton vehicleId={v.id} />
      </div>

      {/* Timeline */}
      {repairJobs.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm border border-dashed border-border rounded-xl">
          Sin trabajos registrados aún
        </div>
      ) : (
        <RepairTimeline jobs={repairJobs} />
      )}
    </div>
  )
}
