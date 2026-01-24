import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { DashboardSidebar } from './components/DashboardSidebar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session?.user) redirect('/login')

  return (
    <div className="flex gap-6 p-4 md:p-6">
      <DashboardSidebar user={session.user} />
      <main className="min-w-0 flex-1 rounded-xl border border-slate-200/80 bg-white p-6 shadow-sm">
        {children}
      </main>
    </div>
  )
}
