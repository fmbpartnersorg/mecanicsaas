import { getWorkshop } from '@/lib/actions/workshop'
import WorkshopForm from '@/components/workshop-form'
import { Building2 } from 'lucide-react'

export const metadata = {
  title: 'Configuración — MecaGest',
}

export default async function ConfiguracionPage() {
  const workshop = await getWorkshop()

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-9 h-9 rounded-xl bg-secondary border border-border flex items-center justify-center">
          <Building2 className="w-4 h-4 text-muted-foreground" />
        </div>
        <div>
          <h1 className="text-xl font-semibold">Mi Taller</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Datos e imagen de tu taller
          </p>
        </div>
      </div>

      {workshop ? (
        <WorkshopForm workshop={workshop} />
      ) : (
        <div className="text-center py-16 border border-dashed border-border rounded-xl">
          <Building2 className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            Tu usuario no tiene un taller asignado.
          </p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            Contactá al administrador del sistema.
          </p>
        </div>
      )}
    </div>
  )
}
