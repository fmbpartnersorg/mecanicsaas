import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import VehicleActions from '@/components/vehicle-actions'
import VehicleTodoList from '@/components/vehicle-todo-list'
import WorkHistoryCarousel from '@/components/work-history-carousel'
import Link from 'next/link'
import { ChevronLeft, Car, User, Phone, Gauge, Cpu } from 'lucide-react'
import type { Vehicle } from '@/lib/types'
import { getVehicleTasks } from '@/lib/actions/vehicle-tasks'
import { getWorkHistory } from '@/lib/actions/work-history'

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

  const v = vehicle as Vehicle
  const metadata = v.vehicle_metadata as Record<string, string>
  const [tasks, workHistory] = await Promise.all([
    getVehicleTasks(id),
    getWorkHistory(id),
  ])

  return (
    <div className="animate-in fade-in duration-500 space-y-6">
      {/* Back */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        Volver al comando
      </Link>

      {/* Vehicle header — full width, two-column layout */}
      <div className="bg-card border border-border/60 rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          {/* Left: icon + plate + model */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <Car className="w-6 h-6 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-3xl font-bold font-mono tracking-widest text-foreground">
                  {v.plate_number}
                </h1>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
                {[v.brand, v.model].filter(Boolean).join(' ') || 'Sin modelo registrado'}
                {metadata?.cc && ` · ${metadata.cc}cc`}
              </p>
            </div>
          </div>

          {/* Right: actions */}
          <VehicleActions vehicle={v} />
        </div>

        {/* Info pills */}
        {(v.client_name || v.client_phone || metadata?.vehicle_type || metadata?.cc) && (
          <div className="mt-5 pt-5 border-t border-border/40 flex flex-wrap gap-3">
            {v.client_name && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/40 rounded-lg px-3 py-1.5">
                <User className="w-3.5 h-3.5 shrink-0" />
                <span>{v.client_name}</span>
              </div>
            )}
            {v.client_phone && (
              <a
                href={`tel:${v.client_phone}`}
                className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/40 rounded-lg px-3 py-1.5 hover:text-foreground transition-colors"
              >
                <Phone className="w-3.5 h-3.5 shrink-0" />
                <span>{v.client_phone}</span>
              </a>
            )}
            {metadata?.vehicle_type && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/40 rounded-lg px-3 py-1.5">
                <Cpu className="w-3.5 h-3.5 shrink-0" />
                <span className="capitalize">{metadata.vehicle_type}</span>
              </div>
            )}
            {metadata?.cc && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/40 rounded-lg px-3 py-1.5">
                <Gauge className="w-3.5 h-3.5 shrink-0" />
                <span>{metadata.cc} cc</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Todo list — full width */}
      <VehicleTodoList vehicleId={v.id} initialTasks={tasks} />

      {/* Work history carousel */}
      <WorkHistoryCarousel sessions={workHistory} />
    </div>
  )
}
