'use server'

import { createClient } from '@/lib/supabase/server'
import { getCurrentProfile } from '@/lib/session'
import { revalidatePath } from 'next/cache'
import type { Workshop } from '@/lib/types'
import { updateWorkshopSchema } from '@/lib/validations'

export async function getWorkshop(): Promise<Workshop | null> {
  const supabase = await createClient()
  const profile = await getCurrentProfile()

  if (!profile.workshop_id) return null

  const { data } = await supabase
    .from('workshops')
    .select('*')
    .eq('id', profile.workshop_id)
    .single()

  return data
}

export async function updateWorkshop(formData: {
  name?: string
  logo_url?: string
  settings?: Record<string, unknown>
}): Promise<{ error: string | null }> {
  // 1. Zod Validation
  const validatedFields = updateWorkshopSchema.safeParse(formData)
  
  if (!validatedFields.success) {
    return { error: validatedFields.error.issues[0]?.message || 'Datos inválidos' }
  }

  const supabase = await createClient()
  const profile = await getCurrentProfile()

  if (!profile.workshop_id) return { error: 'Sin taller asignado' }

  const { error } = await supabase
    .from('workshops')
    .update({ ...validatedFields.data, updated_at: new Date().toISOString() })
    .eq('id', profile.workshop_id)

  if (error) return { error: error.message }

  revalidatePath('/configuracion')
  revalidatePath('/')
  return { error: null }
}

export async function uploadLogo(file: File): Promise<{ url: string | null; error: string | null }> {
  const supabase = await createClient()
  const profile = await getCurrentProfile()

  if (!profile.workshop_id) return { url: null, error: 'Sin taller asignado' }

  const fileExt = file.name.split('.').pop()
  const fileName = `${profile.workshop_id}/logo.${fileExt}`

  const { error: uploadError } = await supabase.storage
    .from('logos')
    .upload(fileName, file, { upsert: true })

  if (uploadError) return { url: null, error: uploadError.message }

  const { data } = supabase.storage.from('logos').getPublicUrl(fileName)

  return { url: data.publicUrl, error: null }
}
