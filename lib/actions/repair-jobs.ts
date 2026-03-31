'use server'

import { createClient } from '@/lib/supabase/server'
import { getWorkshopId } from '@/lib/session'
import { revalidatePath } from 'next/cache'
import type { RepairJob, RepairStatus } from '@/lib/types'
import { createRepairJobSchema, updateRepairStatusSchema } from '@/lib/validations'

export async function createRepairJob(formData: {
  vehicle_id: string
  description: string
  mileage?: number
}): Promise<{ job: RepairJob | null; error: string | null }> {
  // 1. Zod Validation
  const validatedFields = createRepairJobSchema.safeParse(formData)
  
  if (!validatedFields.success) {
    return { job: null, error: validatedFields.error.issues[0]?.message || 'Datos inválidos' }
  }

  const supabase = await createClient()
  const workshopId = await getWorkshopId()

  const { data, error } = await supabase
    .from('repair_jobs')
    .insert({
      ...validatedFields.data,
      workshop_id: workshopId,
      status: 'pending',
    })
    .select()
    .single()

  if (error) return { job: null, error: error.message }

  revalidatePath('/trabajos')
  revalidatePath(`/vehiculo/${formData.vehicle_id}`)
  return { job: data, error: null }
}

export async function updateRepairStatus(
  jobId: string,
  status: RepairStatus
): Promise<{ error: string | null }> {
  // 1. Zod Validation
  const validatedFields = updateRepairStatusSchema.safeParse({ jobId, status })
  
  if (!validatedFields.success) {
    return { error: validatedFields.error.issues[0]?.message || 'Datos inválidos' }
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from('repair_jobs')
    .update({ status: validatedFields.data.status })
    .eq('id', validatedFields.data.jobId)

  if (error) return { error: error.message }

  revalidatePath('/trabajos')
  return { error: null }
}

export async function getRepairJobsByVehicle(
  vehicleId: string
): Promise<RepairJob[]> {
  const supabase = await createClient()

  const { data } = await supabase
    .from('repair_jobs')
    .select('*')
    .eq('vehicle_id', vehicleId)
    .order('created_at', { ascending: false })

  return data ?? []
}

export async function getAllActiveJobs(): Promise<RepairJob[]> {
  const supabase = await createClient()
  const workshopId = await getWorkshopId()

  const { data } = await supabase
    .from('repair_jobs')
    .select('*, vehicles(plate_number, brand, model, client_name)')
    .eq('workshop_id', workshopId)
    .neq('status', 'completed')
    .order('created_at', { ascending: false })

  return (data as RepairJob[]) ?? []
}

export async function getAllJobs(): Promise<RepairJob[]> {
  const supabase = await createClient()
  const workshopId = await getWorkshopId()

  const { data } = await supabase
    .from('repair_jobs')
    .select('*, vehicles(plate_number, brand, model, client_name)')
    .eq('workshop_id', workshopId)
    .order('created_at', { ascending: false })

  return (data as RepairJob[]) ?? []
}
