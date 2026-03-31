'use server'

import { createClient } from '@/lib/supabase/server'
import { getWorkshopId } from '@/lib/session'
import { revalidatePath } from 'next/cache'
import type { Vehicle } from '@/lib/types'
import { vehicleSchema } from '@/lib/validations'

export async function searchVehicleByPlate(
  plate: string
): Promise<Vehicle | null> {
  const supabase = await createClient()
  const workshopId = await getWorkshopId()

  const { data } = await supabase
    .from('vehicles')
    .select('*')
    .eq('workshop_id', workshopId)
    .ilike('plate_number', plate.trim().toUpperCase())
    .maybeSingle()

  return data
}

export async function createVehicle(formData: {
  plate_number: string
  brand: string
  model: string
  client_name: string
  client_phone: string
  vehicle_metadata?: Record<string, unknown>
}): Promise<{ vehicle: Vehicle | null; error: string | null }> {
  // 1. Zod Validation
  const validatedFields = vehicleSchema.safeParse(formData)
  
  if (!validatedFields.success) {
    return { vehicle: null, error: validatedFields.error.issues[0]?.message || 'Datos inválidos' }
  }

  const supabase = await createClient()
  const workshopId = await getWorkshopId()

  // 2. Insert validated data
  const { data, error } = await supabase
    .from('vehicles')
    .insert({
      ...validatedFields.data,
      plate_number: validatedFields.data.plate_number.trim().toUpperCase(),
      workshop_id: workshopId,
    })
    .select()
    .single()

  if (error) return { vehicle: null, error: error.message }

  revalidatePath('/vehiculo')
  return { vehicle: data, error: null }
}

export async function getVehicle(
  id: string
): Promise<Vehicle | null> {
  const supabase = await createClient()

  const { data } = await supabase
    .from('vehicles')
    .select('*')
    .eq('id', id)
    .single()

  return data
}

export async function getAllVehicles(): Promise<Vehicle[]> {
  const supabase = await createClient()
  const workshopId = await getWorkshopId()

  const { data } = await supabase
    .from('vehicles')
    .select('*')
    .eq('workshop_id', workshopId)
    .order('created_at', { ascending: false })

  return data || []
}

export async function updateVehicleDetails(
  id: string,
  formData: {
    plate_number: string
    brand: string
    model: string
    client_name: string
    client_phone: string
    vehicle_metadata?: Record<string, unknown>
  }
): Promise<{ vehicle: Vehicle | null; error: string | null }> {
  const validatedFields = vehicleSchema.safeParse(formData)
  
  if (!validatedFields.success) {
    return { vehicle: null, error: validatedFields.error.issues[0]?.message || 'Datos inválidos' }
  }

  const supabase = await createClient()
  const workshopId = await getWorkshopId()

  const { data, error } = await supabase
    .from('vehicles')
    .update({
      ...validatedFields.data,
      plate_number: validatedFields.data.plate_number.trim().toUpperCase(),
    })
    .eq('id', id)
    .eq('workshop_id', workshopId)
    .select()
    .single()

  if (error) return { vehicle: null, error: error.message }

  revalidatePath(`/vehiculo/${id}`)
  revalidatePath('/')
  return { vehicle: data, error: null }
}

export async function deleteVehicle(id: string): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient()
  const workshopId = await getWorkshopId()

  // 1. Borrar trabajos (Cascade manual)
  const { error: jobsError } = await supabase
    .from('repair_jobs')
    .delete()
    .eq('vehicle_id', id)
    .eq('workshop_id', workshopId)
    
  if (jobsError) {
    return { success: false, error: 'Error al limpiar las órdenes de trabajo del vehículo.' }
  }

  // 2. Borrar vehículo
  const { error } = await supabase
    .from('vehicles')
    .delete()
    .eq('id', id)
    .eq('workshop_id', workshopId)

  if (error) return { success: false, error: error.message }

  revalidatePath('/')
  return { success: true, error: null }
}
