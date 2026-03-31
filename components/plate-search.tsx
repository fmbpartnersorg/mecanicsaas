'use client'

import { useState, useRef, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Loader2 } from 'lucide-react'

export default function PlateSearch() {
  const [plate, setPlate] = useState('')
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!plate.trim()) return
    startTransition(() => {
      router.push(`/?plate=${encodeURIComponent(plate.trim().toUpperCase())}`)
    })
  }

  return (
    <form
      onSubmit={handleSearch}
      className="w-full relative"
    >
      <div className="relative">
        {/* Search icon */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
          {isPending ? (
            <Loader2 className="w-5 h-5 text-primary animate-spin" />
          ) : (
            <Search className="w-5 h-5 text-muted-foreground" />
          )}
        </div>

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={plate}
          onChange={(e) => setPlate(e.target.value.toUpperCase())}
          placeholder="Ej: ABC 123"
          maxLength={10}
          autoFocus
          autoComplete="off"
          spellCheck={false}
          disabled={isPending}
          className="
            w-full h-14 pl-12 pr-32
            bg-background border border-border/50 shadow-sm
            rounded-xl text-xl font-mono tracking-widest
            text-foreground placeholder:text-muted-foreground/30
            focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50
            transition-all disabled:opacity-60
          "
        />

        {/* Submit button */}
        <button
          type="submit"
          disabled={!plate.trim() || isPending}
          className="
            absolute right-1.5 top-1/2 -translate-y-1/2
            h-11 px-6 rounded-lg
            bg-primary text-primary-foreground text-sm font-semibold
            hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed
            shadow-sm hover:shadow-md
            transition-all duration-200
          "
        >
          {isPending ? "Buscando..." : "Buscar"}
        </button>
      </div>

      <p className="flex items-center gap-1.5 text-xs text-muted-foreground/70 mt-3 ml-2 font-medium">
        <span className="w-1.5 h-1.5 rounded-full bg-primary/40 inline-block animate-pulse" />
        Si no existe, se abrirá un formulario para ingresarlo.
      </p>
    </form>
  )
}
