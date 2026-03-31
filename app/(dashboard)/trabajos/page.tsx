import { createClient } from '@/lib/supabase/server'
import { getWorkshopId } from '@/lib/session'
import JobBoard from '@/components/job-board'
import type { RepairJob } from '@/lib/types'

export const metadata = {
  title: 'Tablero de Trabajos — MecaGest',
}

export default async function TrabajosPage() {
  const supabase = await createClient()
  const workshopId = await getWorkshopId()

  const { data } = await supabase
    .from('repair_jobs')
    .select('*, vehicles(plate_number, brand, model, client_name)')
    .eq('workshop_id', workshopId)
    .order('created_at', { ascending: false })

  const jobs = (data ?? []) as (RepairJob & {
    vehicles: {
      plate_number: string
      brand: string | null
      model: string | null
      client_name: string | null
    } | null
  })[]

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold">Tablero de trabajos</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {jobs.length} {jobs.length === 1 ? 'orden registrada' : 'órdenes registradas'}
        </p>
      </div>
      <JobBoard initialJobs={jobs} />
    </div>
  )
}
