import { z } from 'zod'

export const vehicleSchema = z.object({
  plate_number: z.string().min(1, 'La patente es requerida').max(15, 'Patente muy larga'),
  brand: z.string().min(1, 'La marca es requerida').max(50, 'Marca muy larga'),
  model: z.string().min(1, 'El modelo es requerido').max(50, 'Modelo muy largo'),
  client_name: z.string().min(1, 'El nombre del cliente es requerido').max(100, 'Nombre muy largo'),
  client_phone: z.string().min(1, 'El teléfono es requerido').max(20, 'Teléfono muy largo'),
  vehicle_metadata: z.record(z.string(), z.unknown()).optional(),
})

export const updateRepairStatusSchema = z.object({
  jobId: z.string().uuid('ID de trabajo inválido'),
  status: z.enum(['pending', 'in_progress', 'completed'] as const, {
    message: 'Estado inválido',
  }),
})

export const createRepairJobSchema = z.object({
  vehicle_id: z.string().uuid('ID de vehículo inválido'),
  description: z.string().min(1, 'La descripción es requerida').max(1000, 'Descripción máxima de 1000 caracteres'),
  mileage: z.number().int().nonnegative('El kilometraje no puede ser negativo').nullish(),
})

export const updateWorkshopSchema = z.object({
  name: z.string().min(2, 'Nombre demasiado corto').max(100, 'Nombre demasiado largo').optional(),
  logo_url: z.string().url('URL de logo inválida').optional(),
  settings: z.record(z.string(), z.unknown()).optional(),
})
