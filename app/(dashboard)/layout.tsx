import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getCurrentProfile } from '@/lib/session'
import { getWorkshop } from '@/lib/actions/workshop'
import DashboardNav from '@/components/dashboard-nav'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  let profile = null
  let workshop = null

  try {
    profile = await getCurrentProfile()
    workshop = await getWorkshop()
  } catch {
    // Profile not found — still render layout
  }

  return (
    <div className="h-screen w-full bg-background flex flex-col md:flex-row overflow-hidden selection:bg-primary/20">
      <DashboardNav user={user} workshop={workshop} profile={profile} />
      <main className="flex-1 overflow-y-auto w-full relative">
        <div className="container mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-12 max-w-6xl flex flex-col min-h-full">
          {children}
        </div>
      </main>
    </div>
  )
}
