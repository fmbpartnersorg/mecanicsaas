'use server'

import { createClient } from '@/lib/supabase/server'
import { getWorkshopId } from '@/lib/session'
import { revalidatePath } from 'next/cache'

// Mapeamos los estados del todo list a los de repair_jobs
export type TaskStatus = 'todo' | 'in_progress' | 'done'
type DbStatus = 'pending' | 'in_progress' | 'completed'

const toDbStatus: Record<TaskStatus, DbStatus> = {
  todo: 'pending',
  in_progress: 'in_progress',
  done: 'completed',
}

const fromDbStatus: Record<DbStatus, TaskStatus> = {
  pending: 'todo',
  in_progress: 'in_progress',
  completed: 'done',
}

export interface VehicleTask {
  id: string
  vehicle_id: string
  workshop_id: string
  title: string
  status: TaskStatus
  created_at: string
  updated_at: string
}

function mapRow(row: {
  id: string
  vehicle_id: string
  workshop_id: string
  description: string | null
  status: string
  created_at: string
  updated_at: string
}): VehicleTask {
  return {
    id: row.id,
    vehicle_id: row.vehicle_id,
    workshop_id: row.workshop_id,
    title: row.description ?? '',
    status: fromDbStatus[row.status as DbStatus] ?? 'todo',
    created_at: row.created_at,
    updated_at: row.updated_at,
  }
}

export async function createVehicleTask(
  vehicleId: string,
  title: string
): Promise<{ task: VehicleTask | null; error: string | null }> {
  if (!title.trim()) return { task: null, error: 'El título no puede estar vacío' }

  const supabase = await createClient()
  const workshopId = await getWorkshopId()

  const { data, error } = await supabase
    .from('repair_jobs')
    .insert({
      vehicle_id: vehicleId,
      workshop_id: workshopId,
      description: title.trim(),
      status: 'pending',
    })
    .select()
    .single()

  if (error) return { task: null, error: error.message }

  revalidatePath(`/vehiculo/${vehicleId}`)
  return { task: mapRow(data), error: null }
}

export async function updateVehicleTaskStatus(
  taskId: string,
  status: TaskStatus,
  vehicleId: string
): Promise<{ error: string | null }> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('repair_jobs')
    .update({ status: toDbStatus[status] })
    .eq('id', taskId)

  if (error) return { error: error.message }

  revalidatePath(`/vehiculo/${vehicleId}`)
  return { error: null }
}

export async function deleteVehicleTask(
  taskId: string,
  vehicleId: string
): Promise<{ error: string | null }> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('repair_jobs')
    .delete()
    .eq('id', taskId)

  if (error) return { error: error.message }

  revalidatePath(`/vehiculo/${vehicleId}`)
  return { error: null }
}

export async function getVehicleTasks(vehicleId: string): Promise<VehicleTask[]> {
  const supabase = await createClient()

  const { data } = await supabase
    .from('repair_jobs')
    .select('*')
    .eq('vehicle_id', vehicleId)
    .order('created_at', { ascending: true })

  return (data ?? []).map(mapRow)
}
