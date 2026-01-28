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
    <div className="flex flex-col md:flex-row gap-4 md:gap-6 p-3 md:p-4 lg:p-6">
      <DashboardSidebar user={session.user} />
      <main className="min-w-0 flex-1 rounded-xl border border-slate-200/80 bg-white p-4 md:p-6 shadow-sm mt-12 md:mt-0">
        {children}
      </main>
    </div>
  )
}
