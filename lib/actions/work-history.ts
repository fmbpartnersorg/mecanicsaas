'use server'

import { createClient } from '@/lib/supabase/server'

export interface WorkSession {
  sessionNumber: number   // 1 = más antiguo, N = más reciente
  date: string            // 'YYYY-MM-DD'
  tasks: string[]         // descriptions de los repair_jobs de ese día
  totalTasks: number
}

export async function getWorkHistory(vehicleId: string): Promise<WorkSession[]> {
  const supabase = await createClient()

  const { data } = await supabase
    .from('repair_jobs')
    .select('id, description, updated_at')
    .eq('vehicle_id', vehicleId)
    .eq('status', 'completed')
    .order('updated_at', { ascending: false })

  if (!data || data.length === 0) return []

  // Agrupar por día (YYYY-MM-DD usando updated_at)
  const byDay = new Map<string, string[]>()
  for (const job of data) {
    const day = job.updated_at.slice(0, 10) // 'YYYY-MM-DD'
    const desc = job.description?.trim() || 'Tarea sin descripción'
    if (!byDay.has(day)) byDay.set(day, [])
    byDay.get(day)!.push(desc)
  }

  // Ordenar los días de más reciente a más antiguo
  const sortedDays = Array.from(byDay.keys()).sort((a, b) => b.localeCompare(a))
  const total = sortedDays.length

  return sortedDays.map((day, index) => {
    const tasks = byDay.get(day)!
    return {
      sessionNumber: total - index, // el más reciente tiene el número más alto
      date: day,
      tasks,
      totalTasks: tasks.length,
    }
  })
}
