'use server'

import { createClient } from '@/lib/supabase/server'
import type { Profile } from '@/lib/types'

/**
 * Returns the current user's profile (including workshop_id).
 * Throws if not authenticated.
 */
export async function getCurrentProfile(): Promise<Profile> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error('No autenticado')

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error || !data) throw new Error('Perfil no encontrado')
  return data as Profile
}

/**
 * Returns the workshop_id for the current user.
 * Throws if not set.
 */
export async function getWorkshopId(): Promise<string> {
  const profile = await getCurrentProfile()
  if (!profile.workshop_id) throw new Error('Usuario sin taller asignado')
  return profile.workshop_id
}
