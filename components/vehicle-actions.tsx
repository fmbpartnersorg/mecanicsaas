'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, Trash2, Loader2, AlertCircle } from 'lucide-react'
import { deleteVehicle, updateVehicleDetails } from '@/lib/actions/vehicles'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { Vehicle } from '@/lib/types'

interface Props {
  vehicle: Vehicle
}

export default function VehicleActions({ vehicle }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  
  // States for Edit Form
  const metadata = (vehicle.vehicle_metadata || {}) as Record<string, string>
  const [editData, setEditData] = useState({
    plate_number: vehicle.plate_number,
    brand: vehicle.brand || '',
    model: vehicle.model || '',
    client_name: vehicle.client_name || '',
    client_phone: vehicle.client_phone || '',
    cc: metadata.cc || '',
    vehicle_type: metadata.vehicle_type || 'auto',
  })
  
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  function updateField(key: string, value: string) {
    setEditData((p) => ({ ...p, [key]: value }))
  }

  function handleUpdate(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      const { error } = await updateVehicleDetails(vehicle.id, {
        plate_number: editData.plate_number.trim().toUpperCase(),
        brand: editData.brand,
        model: editData.model,
        client_name: editData.client_name,
        client_phone: editData.client_phone,
        vehicle_metadata: {
           ...metadata,
           cc: editData.cc,
           vehicle_type: editData.vehicle_type,
        }
      })
      
      if (error) {
        toast.error(`Error: ${error}`)
        return
      }
      toast.success('Vehículo actualizado exitosamente')
      setIsEditDialogOpen(false)
    })
  }

  function handleDelete() {
    startTransition(async () => {
      const { error } = await deleteVehicle(vehicle.id)
      if (error) {
        toast.error(`Error al eliminar: ${error}`)
        return
      }
      toast.success('Vehículo (y su historial) eliminado.')
      router.push('/')
      // Also forcing a router refresh because we redirect to root that might have cached listings
      router.refresh()
    })
  }

  return (
    <div className="flex items-center gap-2">
      {/* UPDATE DIALOG */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogTrigger 
          render={<Button variant="outline" size="icon" className="h-9 w-9 text-muted-foreground border-border/50 hover:bg-secondary hover:text-foreground transition-all shadow-sm" />}
        >
          <Pencil className="w-4 h-4" />
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Vehículo</DialogTitle>
            <DialogDescription>
              Modifica los detalles registrales y de contacto.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleUpdate} className="space-y-4 py-2">
            <div className="grid gap-2">
              <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Matrícula</label>
              <Input
                value={editData.plate_number}
                onChange={(e) => updateField('plate_number', e.target.value)}
                required
                className="font-mono text-base tracking-widest bg-secondary/50"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Marca</label>
                <Input
                  value={editData.brand}
                  onChange={(e) => updateField('brand', e.target.value)}
                  className="bg-secondary/50"
                />
              </div>
              <div className="grid gap-2">
                <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Modelo</label>
                <Input
                  value={editData.model}
                  onChange={(e) => updateField('model', e.target.value)}
                  className="bg-secondary/50"
                />
              </div>
            </div>

            {editData.vehicle_type === 'moto' && (
              <div className="grid gap-2">
                <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Cilindrada (cc)</label>
                <Input
                  value={editData.cc}
                  onChange={(e) => updateField('cc', e.target.value)}
                  type="number"
                  className="bg-secondary/50"
                />
              </div>
            )}

            <div className="grid gap-2">
              <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Dueño / Cliente</label>
              <Input
                value={editData.client_name}
                onChange={(e) => updateField('client_name', e.target.value)}
                className="bg-secondary/50"
              />
            </div>

            <div className="grid gap-2">
              <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Teléfono</label>
              <Input
                value={editData.client_phone}
                onChange={(e) => updateField('client_phone', e.target.value)}
                type="tel"
                className="bg-secondary/50"
              />
            </div>

            <Button type="submit" disabled={isPending} className="w-full mt-4 h-11">
              {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {isPending ? 'Guardando...' : 'Guardar cambios'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* DELETE ALERT DIALOG */}
      <AlertDialog>
        <AlertDialogTrigger 
          render={<Button variant="outline" size="icon" className="h-9 w-9 text-muted-foreground border-border/50 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-all shadow-sm group" />}
        >
          <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-destructive" />
              ¿Eliminar vehículo definitivamente?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Se borrará permanentemente el vehículo <strong className="text-foreground">{vehicle.plate_number}</strong>. También se borrará todo su historial de trabajo en cascada para mantener la integridad. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {isPending ? 'Eliminando...' : 'Sí, eliminar todo'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
