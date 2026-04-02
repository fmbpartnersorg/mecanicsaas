export type RepairStatus = 'pending' | 'in_progress' | 'completed'

export interface Workshop {
  id: string
  name: string
  slug: string
  logo_url: string | null
  settings: Record<string, unknown>
  owner_id: string
  created_at: string
  updated_at: string
}

export interface Profile {
  id: string
  workshop_id: string | null
  role: 'owner' | 'staff'
  full_name: string | null
  created_at: string
}

export interface Vehicle {
  id: string
  workshop_id: string
  plate_number: string
  brand: string | null
  model: string | null
  vehicle_metadata: Record<string, unknown>
  client_name: string | null
  client_phone: string | null
  created_at: string
  updated_at: string
}

export interface RepairJob {
  id: string
  vehicle_id: string
  workshop_id: string
  description: string | null
  mileage: number | null
  status: RepairStatus
  created_at: string
  updated_at: string
}

export interface VehicleWithJobs extends Vehicle {
  repair_jobs: RepairJob[]
}

export const STATUS_LABELS: Record<RepairStatus, string> = {
  pending: 'Pendiente',
  in_progress: 'En Proceso',
  completed: 'Terminado',
}

export const STATUS_COLORS: Record<RepairStatus, string> = {
  pending: 'bg-amber-100 text-amber-700 border-amber-300',
  in_progress: 'bg-blue-100 text-blue-700 border-blue-300',
  completed: 'bg-emerald-100 text-emerald-700 border-emerald-300',
}
