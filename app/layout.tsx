import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'MecaGest — Gestión de Taller',
  description: 'Sistema de gestión para talleres mecánicos',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className="dark">
      <body className={`${inter.variable} font-sans`}>
        {children}
        <Toaster position="bottom-right" theme="dark" />
      </body>
    </html>
  )
}
