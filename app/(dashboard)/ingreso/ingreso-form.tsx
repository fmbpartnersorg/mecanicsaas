'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createVehicle } from '@/lib/actions/vehicles'
import { createRepairJob } from '@/lib/actions/repair-jobs'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Loader2, ChevronLeft, Car, Wrench } from 'lucide-react'
import Link from 'next/link'

interface Props {
  initialPlate: string
  workshopType: string
}

export default function IngresoForm({ initialPlate, workshopType }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  // Determinamos el valor por defecto del dropdown o el valor forzado interno
  const defaultVehicleType = workshopType === 'motos' ? 'moto' : 'auto'

  const [vehicle, setVehicle] = useState({
    plate_number: initialPlate,
    brand: '',
    model: '',
    client_name: '',
    client_phone: '',
    cc: '',
    vehicle_type: defaultVehicleType,
  })

  const [job, setJob] = useState({
    description: '',
    mileage: '',
  })

  function updateVehicle(key: string, value: string) {
    setVehicle((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!vehicle.plate_number.trim()) {
      toast.error('La matrícula es obligatoria')
      return
    }

    startTransition(async () => {
      const { vehicle: newVehicle, error: vehicleError } = await createVehicle({
        plate_number: vehicle.plate_number.toUpperCase(),
        brand: vehicle.brand,
        model: vehicle.model,
        client_name: vehicle.client_name,
        client_phone: vehicle.client_phone,
        vehicle_metadata: {
          cc: vehicle.cc,
          vehicle_type: vehicle.vehicle_type,
        },
      })

      if (vehicleError) {
        toast.error(`Error al crear vehículo: ${vehicleError}`)
        return
      }

      if (newVehicle && job.description.trim()) {
        const { error: jobError } = await createRepairJob({
          vehicle_id: newVehicle.id,
          description: job.description,
          mileage: job.mileage ? parseInt(job.mileage) : undefined,
        })

        if (jobError) {
          toast.error(`Vehículo creado, pero error en trabajo: ${jobError}`)
          router.push(`/vehiculo/${newVehicle.id}`)
          return
        }
      }

      toast.success('Vehículo y trabajo ingresados exitosamente')
      router.push(newVehicle ? `/vehiculo/${newVehicle.id}` : '/')
    })
  }

  // Lógica de visibilidad
  const isAutoShop = workshopType === 'autos'
  const isMotoShop = workshopType === 'motos'
  const showVehicleTypeDropdown = workshopType !== 'autos' && workshopType !== 'motos'
  const showCilindrada = !isAutoShop && vehicle.vehicle_type === 'moto' // Mostrar solo si no es un taller exclusivo de autos y si se eligio moto, o si es un taller de motos puro.

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in duration-500">
      {/* Back */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ChevronLeft className="w-4 h-4" />
        Volver al comando
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Ingreso rápido</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Registrá el {isMotoShop ? 'motovehículo' : 'vehículo'} y su primera orden de trabajo.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        {/* Vehicle section */}
        <section className="bg-card border border-border/40 p-6 rounded-2xl shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Car className="w-4 h-4 text-primary" />
            </div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Datos del vehículo
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                Matrícula <span className="text-destructive">*</span>
              </label>
              <Input
                value={vehicle.plate_number}
                onChange={(e) => updateVehicle('plate_number', e.target.value.toUpperCase())}
                placeholder="ABC 123"
                required
                className="font-mono text-xl tracking-widest h-14 bg-background border-border/50 shadow-sm focus-visible:ring-primary/30"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Marca</label>
              <Input
                value={vehicle.brand}
                onChange={(e) => updateVehicle('brand', e.target.value)}
                placeholder={isMotoShop ? "Honda, Yamaha..." : "Toyota, Ford..."}
                className="bg-background border-border/50 shadow-sm h-11"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Modelo</label>
              <Input
                value={vehicle.model}
                onChange={(e) => updateVehicle('model', e.target.value)}
                placeholder={isMotoShop ? "CB 250, Tornado..." : "Corolla, Hilux..."}
                className="bg-background border-border/50 shadow-sm h-11"
              />
            </div>

            {showVehicleTypeDropdown && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Tipo</label>
                <select
                  value={vehicle.vehicle_type}
                  onChange={(e) => updateVehicle('vehicle_type', e.target.value)}
                  className="w-full h-11 px-3 rounded-md bg-background border border-border/50 shadow-sm text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow"
                >
                  <option value="auto">Auto</option>
                  <option value="moto">Moto</option>
                  <option value="camioneta">Camioneta</option>
                  <option value="otro">Otro</option>
                </select>
              </div>
            )}

            {showCilindrada && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Cilindrada (cc)</label>
                <Input
                  value={vehicle.cc}
                  onChange={(e) => updateVehicle('cc', e.target.value)}
                  placeholder="250, 110, 600..."
                  type="number"
                  className="bg-background border-border/50 shadow-sm h-11"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Dueño / Cliente</label>
              <Input
                value={vehicle.client_name}
                onChange={(e) => updateVehicle('client_name', e.target.value)}
                placeholder="Nombre completo"
                className="bg-background border-border/50 shadow-sm h-11"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Teléfono / Celular</label>
              <Input
                value={vehicle.client_phone}
                onChange={(e) => updateVehicle('client_phone', e.target.value)}
                placeholder="+54 9 11..."
                type="tel"
                className="bg-background border-border/50 shadow-sm h-11"
              />
            </div>
          </div>
        </section>

        {/* Job section */}
        <section className="bg-card border border-border/40 p-6 rounded-2xl shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Wrench className="w-4 h-4 text-primary" />
            </div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Primera orden de trabajo{' '}
              <span className="normal-case text-muted-foreground/60 font-normal ml-1">(opcional)</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Descripción o falla</label>
              <textarea
                value={job.description}
                onChange={(e) => setJob((p) => ({ ...p, description: e.target.value }))}
                placeholder="Cambio de aceite, ruidos en freno..."
                rows={4}
                className="w-full px-3 py-3 rounded-md bg-background border border-border/50 shadow-sm text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow resize-none"
              />
            </div>

            <div className="space-y-1.5 w-1/2">
              <label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Kilometraje / Odómetro</label>
              <Input
                value={job.mileage}
                onChange={(e) => setJob((p) => ({ ...p, mileage: e.target.value }))}
                placeholder="Ej: 45000"
                type="number"
                min="0"
                className="bg-background border-border/50 shadow-sm h-11"
              />
            </div>
          </div>
        </section>

        <div className="pt-2">
          <Button
            type="submit"
            disabled={isPending}
            className="w-full h-14 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-semibold shadow hover:shadow-md transition-all text-base"
          >
            {isPending ? (
              <>
                <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                Registrando ingreso…
              </>
            ) : (
              'Ingresar y Guardar'
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
