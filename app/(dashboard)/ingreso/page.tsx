import { getWorkshop } from '@/lib/actions/workshop'
import IngresoForm from './ingreso-form'
import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Nuevo Ingreso — MecaGest',
}

export default async function IngresoPage({
  searchParams,
}: {
  searchParams: Promise<{ plate?: string }>
}) {
  const { plate } = await searchParams
  const workshop = await getWorkshop()

  if (!workshop) {
    redirect('/configuracion')
  }

  const workshopType = (workshop.settings as Record<string, string>)?.workshop_type ?? 'mixto'

  return <IngresoForm initialPlate={plate ?? ''} workshopType={workshopType} />
}
