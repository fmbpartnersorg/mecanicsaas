'use client'

import { useState, useTransition } from 'react'
import { updateWorkshop, uploadLogo } from '@/lib/actions/workshop'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { Loader2, Upload, Building2 } from 'lucide-react'
import type { Workshop } from '@/lib/types'
import Image from 'next/image'

interface Props {
  workshop: Workshop
}

export default function WorkshopForm({ workshop }: Props) {
  const [name, setName] = useState(workshop.name)
  const [logoPreview, setLogoPreview] = useState<string | null>(workshop.logo_url)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [workshopType, setWorkshopType] = useState<string>(
    (workshop.settings as Record<string, string>)?.workshop_type ?? 'mixto'
  )
  const [isPending, startTransition] = useTransition()

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setLogoFile(file)
    setLogoPreview(URL.createObjectURL(file))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()

    startTransition(async () => {
      let logoUrl = workshop.logo_url

      // Upload logo if there's a new file
      if (logoFile) {
        const { url, error: uploadError } = await uploadLogo(logoFile)
        if (uploadError) {
          toast.error(`Error al subir el logo: ${uploadError}`)
          return
        }
        logoUrl = url
      }

      const { error } = await updateWorkshop({
        name,
        logo_url: logoUrl ?? undefined,
        settings: {
          ...(workshop.settings as Record<string, unknown>),
          workshop_type: workshopType,
        },
      })

      if (error) {
        toast.error(error)
        return
      }

      toast.success('Configuración guardada')
    })
  }

  return (
    <form onSubmit={handleSave} className="max-w-lg space-y-6">
      {/* Logo */}
      <div className="space-y-3">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Logo del taller
        </label>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl bg-secondary border border-border flex items-center justify-center overflow-hidden">
            {logoPreview ? (
              <Image
                src={logoPreview}
                alt="Logo"
                width={64}
                height={64}
                className="object-contain w-full h-full"
              />
            ) : (
              <Building2 className="w-6 h-6 text-muted-foreground/40" />
            )}
          </div>
          <div>
            <label
              htmlFor="logo-upload"
              className="
                inline-flex items-center gap-2 px-3 py-1.5 rounded-md
                border border-border bg-secondary hover:bg-accent
                text-xs font-medium text-muted-foreground hover:text-foreground
                cursor-pointer transition-colors
              "
            >
              <Upload className="w-3.5 h-3.5" />
              Subir imagen
            </label>
            <input
              id="logo-upload"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <p className="text-[11px] text-muted-foreground/50 mt-1">
              PNG, JPG o SVG — máx. 2MB
            </p>
          </div>
        </div>
      </div>

      {/* Name */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Nombre del taller
        </label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Taller El Rápido"
          required
          className="bg-secondary border-border"
        />
      </div>

      {/* Workshop type */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Tipo de taller
        </label>
        <select
          value={workshopType}
          onChange={(e) => setWorkshopType(e.target.value)}
          className="w-full h-9 px-3 rounded-md bg-secondary border border-border text-sm text-foreground focus:outline-none focus:border-primary/60 transition-colors"
        >
          <option value="mixto">Mixto (autos y motos)</option>
          <option value="autos">Solo autos</option>
          <option value="motos">Solo motos</option>
          <option value="camiones">Camiones / utilitarios</option>
        </select>
      </div>

      <Button
        type="submit"
        disabled={isPending}
        className="h-10 px-6 bg-primary text-primary-foreground hover:bg-primary/90"
      >
        {isPending ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Guardando…
          </>
        ) : (
          'Guardar cambios'
        )}
      </Button>
    </form>
  )
}
