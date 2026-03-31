'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import type { Workshop, Profile } from '@/lib/types'
import { Wrench, Search, ClipboardList, Settings, LogOut, Menu, X, Home } from 'lucide-react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { useState } from 'react'

interface DashboardNavProps {
  user: User
  workshop: Workshop | null
  profile: Profile | null
}

const navItems = [
  { href: '/', label: 'Buscar patente', icon: Search },
  { href: '/trabajos', label: 'Tablero de Trabajos', icon: ClipboardList },
  { href: '/configuracion', label: 'Mi Taller', icon: Home },
]

export default function DashboardNav({ workshop }: DashboardNavProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [isOpen, setIsOpen] = useState(false)

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-card/60 backdrop-blur-xl border-r border-border/40 w-64 p-4">
      <div className="flex items-center gap-3 mb-8 px-2 mt-2">
        {workshop?.logo_url ? (
          <Image
            src={workshop.logo_url}
            alt={workshop.name}
            width={32}
            height={32}
            className="w-8 h-8 shrink-0 rounded-lg object-cover shadow-sm bg-white"
          />
        ) : (
          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shadow-inner">
            <Wrench className="w-4 h-4 text-primary" />
          </div>
        )}
        <div className="flex flex-col">
          <span className="text-sm font-semibold truncate w-40 text-foreground">
            {workshop?.name ?? 'MecaGest'}
          </span>
          <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">Panel</span>
        </div>
      </div>

      <nav className="flex-1 space-y-1.5 flex flex-col">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setIsOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 group relative',
                active
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-muted-foreground hover:bg-muted/80 hover:text-foreground hover:translate-x-1'
              )}
            >
              {active && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-primary rounded-r-md" />
              )}
              <Icon className={cn("w-4 h-4", active ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="mt-auto pt-4 border-t border-border/40">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-200"
        >
          <LogOut className="w-4 h-4" />
          Salir de la cuenta
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden flex-none flex items-center justify-between p-4 border-b border-border/40 bg-card/60 backdrop-blur-xl w-full">
        <div className="flex items-center gap-3">
          {workshop?.logo_url ? (
            <Image
              src={workshop.logo_url}
              alt={workshop.name}
              width={28}
              height={28}
              className="w-7 h-7 shrink-0 rounded-lg object-cover bg-white"
            />
          ) : (
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <Wrench className="w-3.5 h-3.5 text-primary" />
            </div>
          )}
          <span className="text-sm font-semibold truncate max-w-[140px]">
            {workshop?.name ?? 'MecaGest'}
          </span>
        </div>
        <button onClick={() => setIsOpen(true)} className="p-2 -mr-2 text-muted-foreground">
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-64 bg-card shadow-2xl z-50 animate-in slide-in-from-left-2 duration-300">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute right-4 top-4 p-2 text-muted-foreground hover:text-foreground z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden md:block h-screen w-64 flex-shrink-0">
        <SidebarContent />
      </div>
    </>
  )
}
