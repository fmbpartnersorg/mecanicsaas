'use client'

import { useState, useTransition } from 'react'
import { createRepairJob } from '@/lib/actions/repair-jobs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { Plus, Loader2, X } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Props {
  vehicleId: string
}

export default function NewJobButton({ vehicleId }: Props) {
  const [open, setOpen] = useState(false)
  const [description, setDescription] = useState('')
  const [mileage, setMileage] = useState('')
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleCreate() {
    if (!description.trim()) {
      toast.error('Descripción obligatoria')
      return
    }
    startTransition(async () => {
      const { error } = await createRepairJob({
        vehicle_id: vehicleId,
        description: description.trim(),
        mileage: mileage ? parseInt(mileage) : undefined,
      })
      if (error) {
        toast.error(error)
        return
      }
      toast.success('Trabajo agregado')
      setOpen(false)
      setDescription('')
      setMileage('')
      router.refresh()
    })
  }

  if (!open) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="h-8 text-xs border-border hover:bg-secondary"
      >
        <Plus className="w-3.5 h-3.5 mr-1" />
        Nuevo trabajo
      </Button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-sm">Nuevo trabajo</h3>
          <button
            onClick={() => setOpen(false)}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Descripción *</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Cambio de aceite, revisión de frenos…"
              rows={3}
              autoFocus
              className="w-full px-3 py-2 rounded-md bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/60 transition-colors resize-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Kilometraje</label>
            <Input
              value={mileage}
              onChange={(e) => setMileage(e.target.value)}
              placeholder="45000"
              type="number"
              min="0"
              className="bg-secondary border-border"
            />
          </div>
        </div>

        <div className="flex gap-2 mt-5">
          <Button
            variant="ghost"
            className="flex-1 h-9 text-sm"
            onClick={() => setOpen(false)}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleCreate}
            disabled={isPending}
            className="flex-1 h-9 text-sm bg-primary"
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              'Crear trabajo'
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
