import { redirect } from 'next/navigation'
import PlateSearch from '@/components/plate-search'
import { createClient } from '@/lib/supabase/server'
import { getAllVehicles } from '@/lib/actions/vehicles'
import { Car, CalendarDays, Plus } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'Buscar Patente — MecaGest',
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ plate?: string }>
}) {
  const { plate } = await searchParams

  if (plate && plate.trim()) {
    const supabase = await createClient()
    const { data: profileData } = await supabase
      .from('profiles')
      .select('workshop_id')
      .single()

    if (profileData?.workshop_id) {
      const { data: vehicle } = await supabase
        .from('vehicles')
        .select('id')
        .eq('workshop_id', profileData.workshop_id)
        .ilike('plate_number', plate.trim().toUpperCase())
        .maybeSingle()

      if (vehicle) {
        redirect(`/vehiculo/${vehicle.id}`)
      } else {
        redirect(`/ingreso?plate=${encodeURIComponent(plate.trim().toUpperCase())}`)
      }
    }
  }

  const vehicles = await getAllVehicles()

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('es-AR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date(dateString))
  }

  return (
    <div className="flex flex-col w-full animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Buscar vehículo
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Busca por patente o selecciona uno del historial reciente.
        </p>
      </div>

      {/* Main Actions */}
      <div className="w-full max-w-4xl flex flex-col sm:flex-row items-stretch gap-4 mb-12">
        <div className="flex-[2] bg-card border border-border/40 rounded-xl p-6 shadow-sm">
          <PlateSearch />
        </div>
        
        <Link 
          href="/ingreso"
          className="flex-1 shrink-0 bg-primary/5 hover:bg-primary/10 border border-primary/20 hover:border-primary/30 text-primary rounded-xl p-6 flex flex-col items-center justify-center gap-3 transition-all duration-200 shadow-sm hover:shadow"
        >
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Plus className="w-5 h-5" />
          </div>
          <div className="text-center">
            <span className="font-semibold text-sm block">Nuevo Ingreso</span>
            <span className="text-[10px] opacity-70 mt-1 block">Añadir sin buscar</span>
          </div>
        </Link>
      </div>

      <div className="w-full">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium tracking-tight">Vehículos registrados</h2>
          <span className="text-xs font-medium bg-secondary text-secondary-foreground px-2 py-1 rounded-md">
            {vehicles.length} total
          </span>
        </div>

        {vehicles.length === 0 ? (
          <div className="text-center py-12 border border-border/40 rounded-xl border-dashed">
            <Car className="w-8 h-8 text-muted-foreground/50 mx-auto mb-3" />
            <h3 className="text-sm font-medium text-foreground">No hay vehículos</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Los vehículos aparecerán aquí una vez registrados mediante la búsqueda.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {vehicles.map((v) => (
              <Link
                key={v.id}
                href={`/vehiculo/${v.id}`}
                className="group flex flex-col p-4 bg-card/60 hover:bg-card border border-border/40 hover:border-border rounded-xl transition-all duration-300 shadow-sm hover:shadow-md"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-lg font-bold tracking-wider text-primary group-hover:text-primary transition-colors">
                    {v.plate_number}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-secondary/80 group-hover:bg-secondary flex items-center justify-center transition-colors">
                    <Car className="w-4 h-4 text-muted-foreground group-hover:text-foreground" />
                  </div>
                </div>
                
                <h3 className="text-sm font-medium text-foreground truncate">{v.brand} {v.model}</h3>
                <p className="text-xs text-muted-foreground mt-1 truncate">{v.client_name}</p>
                
                <div className="mt-4 pt-3 border-t border-border/40 flex items-center gap-2 text-[10px] text-muted-foreground uppercase tracking-widest">
                  <CalendarDays className="w-3 h-3" />
                  <span>
                    {formatDate(v.created_at)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
